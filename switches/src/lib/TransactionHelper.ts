import {
  CreditCard,
  Transaction,
  TransactionMethod,
  TransactionStatus
} from 'ns8-protect-models';
import { get } from 'lodash';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { Payment as MagentoPayment } from '@ns8/magento2-rest-client';
import { PaymentAdditionalInfo as MagentoPaymentAdditionalInfo } from '@ns8/magento2-rest-client';
import { VaultPaymentToken as MagentoVaultPaymentToken } from '@ns8/magento2-rest-client';
import { HelperBase } from './HelperBase';

/**
 * Utility class for working with Magento Transaction data
 */
export class TransactionHelper extends HelperBase {
  /**
   * Convert a Magento Payment into a TransactionMethod enum
   */
  private getTransactionMethod = (payment: MagentoPayment): TransactionMethod => {
    if (payment.cc_type && payment.cc_last4) {
      return TransactionMethod.CC;
    }
    return ModelTools.stringToTransactionMethod(payment.method);
  }

  /**
   * Get the Magento Transaction Id
   */
  private getPlatformId = (payment: MagentoPayment): string => {
    const vault: MagentoVaultPaymentToken | undefined = get(payment, 'extension_attributes.vault_payment_token') as MagentoVaultPaymentToken;
    if (!vault || !vault.entity_id) return `${payment.entity_id}`;
    else return `${vault.entity_id}`;
  }

  /**
   * Get the TransactionStatus from the Magento Order
   */
  private getStatus = (): TransactionStatus => {
    if (this.MagentoOrder.status_histories) {
      const historyCount = this.MagentoOrder.status_histories.length;
      if (historyCount === 1) {
        //If we only have one history, return the status
        return ModelTools.stringToTransactionStatus(this.MagentoOrder.status_histories[0].status);
      } else if (historyCount > 1) {
        //Otherwise, return the last status available
        return ModelTools.stringToTransactionStatus(this.MagentoOrder.status_histories[historyCount - 1].status);
      }
    }
    //If all else fails, assume the transaction was a success (for now)
    return TransactionStatus.SUCCESS;
  }

  /**
   * Converts the Magento Order into Protect Transactions
   */
  public toTransactions = async (): Promise<Transaction[]> => {
    const ret: Transaction[] = [];
    try {
      const payment: MagentoPayment = this.MagentoOrder.payment;

      const trans = new Transaction({
        //Depending on the payment method, amount can live in different places
        amount: payment.amount_authorized || payment.amount_ordered,
        currency: this.MagentoOrder.order_currency_code,
        processedAt: new Date(this.MagentoOrder.updated_at),
      });
      trans.method = this.getTransactionMethod(payment);
      if (trans.method === TransactionMethod.CC) {
        const customerId = get(payment, 'extension_attributes.vault_payment_token.customer_id') as number;
        //The Order data received both from the switchboard context and from the Order API is incomplete.
        //Fetch the customer and the Magento transaction from the API in order to continue
        const customer = await this.MagentoClient.getCustomer(customerId);
        const magentoTrans = await this.MagentoClient.getTransaction(payment.cc_trans_id || payment.last_trans_id);
        if (null !== customer && null !== magentoTrans) {
          trans.creditCard = new CreditCard({
            cardExpiration: `${payment.cc_exp_month}/${payment.cc_exp_year}`,
            cardHolder: `${customer.firstname} ${customer.lastname}`,
            creditCardBin: '', //Magento does not give us the full credit card number, so we cannot currently calculate the Bin (and it is not provided)
            creditCardCompany: payment.cc_type,
            creditCardNumber: payment.cc_last4,
            gateway: get(payment, 'extension_attributes.vault_payment_token.gateway_token'),
            transactionType: ModelTools.stringToCreditCardTransactionType(magentoTrans.txn_type)
          });

          //These `payment_additional_info` properties are Magento's version of EAV structures.
          //Literally any key/value can exist. It is usually safe to assume that the values will always be strings.
          const additionalInfo = get(this.MagentoOrder, 'extension_attributes.payment_additional_info') as MagentoPaymentAdditionalInfo[];

          //Authorize.Net has a first class AVS status; other CC providers do not
          if (payment.cc_avs_status) {
            trans.creditCard.avsResultCode = payment.cc_avs_status;
          } else {
            const avs = additionalInfo.find((info) => {
              if (info.key.startsWith('avs')) return true;
            });
            trans.creditCard.avsResultCode = get(avs, 'value');
          }
          //CVV does not consistently exist, nor is in named the same way across payment providers.
          const cvv = additionalInfo.find((info) => {
            if (info.key.startsWith('cvv')) return true;
          });
          trans.creditCard.cvvResultCode = get(cvv, 'value');
        }
      }
      trans.platformId = this.getPlatformId(payment);
      trans.status = this.getStatus();
      ret.push(trans);
    } catch (e) {
      this.error(`Failed create Transactions`, e);
    }
    return ret;
  }
}
