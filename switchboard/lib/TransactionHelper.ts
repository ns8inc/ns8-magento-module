import { CreditCard, Transaction, TransactionMethod, TransactionStatus } from 'ns8-protect-models';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import {
  Payment as MagentoPayment,
  PaymentAdditionalInfo as MagentoPaymentAdditionalInfo,
} from '@ns8/magento2-rest-client';
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
  };

  /**
   * Get the Magento Transaction Id
   */
  private getPlatformId = (payment: MagentoPayment): string => {
    let ret = '';
    if (payment) {
      if (payment.extension_attributes && payment.extension_attributes.vault_payment_token) {
        const vault = payment.extension_attributes.vault_payment_token;
        if (vault.entity_id) {
          ret = `${vault.entity_id}`;
        }
      } else {
        ret = `${payment.entity_id}`;
      }
    }
    return ret;
  };

  /**
   * Get the Magento Customer Id
   */
  private getCustomerId = (payment: MagentoPayment): number | undefined => {
    let ret: number | undefined;
    if (payment) {
      if (payment.extension_attributes && payment.extension_attributes.vault_payment_token) {
        const vault = payment.extension_attributes.vault_payment_token;
        if (vault.customer_id) {
          ret = vault.customer_id;
        }
      } else {
        const { data } = this.SwitchContext;
        if (data && data.order && data.order.customer_id) {
          ret = data.order.customer_id as number;
        }
      }
    }
    return ret;
  };

  /**
   * Get the Magento Gateway
   */
  private getGateway = (payment: MagentoPayment): string | undefined => {
    let ret: string | undefined;
    if (payment) {
      if (payment.extension_attributes && payment.extension_attributes.vault_payment_token) {
        const vault = payment.extension_attributes.vault_payment_token;
        if (vault.gateway_token) {
          ret = vault.gateway_token;
        }
      }
    }
    return ret;
  };

  /**
   * Get any [[MagentoPaymentAdditionalInfo]] that may exist.
   * These `payment_additional_info` properties are Magento's version of EAV structures.
   * Literally any key/value can exist. It is usually safe to assume that the values will always be strings.
   */
  private getPaymentAdditionalInfo = (): MagentoPaymentAdditionalInfo[] | undefined => {
    let ret: MagentoPaymentAdditionalInfo[] | undefined;
    if (this.MagentoOrder.extension_attributes && this.MagentoOrder.extension_attributes.payment_additional_info) {
      ret = this.MagentoOrder.extension_attributes.payment_additional_info;
    }
    return ret;
  };

  /**
   * Get the AVS code, if any
   */
  private getAvsResultCode = (payment: MagentoPayment): string | undefined => {
    let ret: string | undefined;

    // Authorize.Net has a first class AVS status; other CC providers do not
    if (payment.cc_avs_status) {
      ret = payment.cc_avs_status;
    } else {
      const additionalInfo = this.getPaymentAdditionalInfo();
      if (additionalInfo) {
        const avs = additionalInfo.find((info) => info?.key?.startsWith('avs'));
        if (avs && avs.value) {
          ret = avs.value;
        }
      }
    }
    return ret;
  };

  /**
   * Get the AVS code, if any
   */
  private getCvvAvsResultCode = (): string | undefined => {
    let ret: string | undefined;
    const additionalInfo = this.getPaymentAdditionalInfo();
    if (additionalInfo) {
      // CVV does not consistently exist, nor is in named the same way across payment providers.
      const cvv = additionalInfo.find((info) => info?.key?.startsWith('cvv'));
      if (cvv && cvv.value) {
        ret = cvv.value;
      }
    }
    return ret;
  };

  /**
   * Get the TransactionStatus from the Magento Order
   */
  private getStatus = (): TransactionStatus => {
    if (this.MagentoOrder.status_histories) {
      const historyCount = this.MagentoOrder.status_histories.length;
      if (historyCount === 1) {
        // If we only have one history, return the status
        return ModelTools.stringToTransactionStatus(this.MagentoOrder.status_histories[0].status);
      }
      if (historyCount > 1) {
        // Otherwise, return the last status available
        return ModelTools.stringToTransactionStatus(this.MagentoOrder.status_histories[historyCount - 1].status);
      }
    }
    // If all else fails, assume the transaction was a success (for now)
    return TransactionStatus.SUCCESS;
  };

  /**
   * Converts the Magento Order into Protect Transactions
   */
  public toTransactions = async (): Promise<Transaction[]> => {
    const ret: Transaction[] = [];
    try {
      const { payment } = this.MagentoOrder;

      const trans = new Transaction({
        // Depending on the payment method, amount can live in different places
        amount: payment.amount_authorized || payment.amount_ordered,
        currency: this.MagentoOrder.order_currency_code,
        processedAt: new Date(this.MagentoOrder.updated_at),
      });
      trans.method = this.getTransactionMethod(payment);
      if (trans.method === TransactionMethod.CC) {
        const customerId = this.getCustomerId(payment);
        if (customerId) {
          // The Order data received both from the switchboard context and from the Order API is incomplete.
          // Fetch the customer and the Magento transaction from the API in order to continue
          const customer = await this.MagentoClient.getCustomer(customerId);
          const magentoTrans = await this.MagentoClient.getTransaction(payment.cc_trans_id || payment.last_trans_id);
          if (customer !== null && magentoTrans !== null) {
            const cardExpiration =
              payment.cc_exp_month && payment.cc_exp_year ? `${payment.cc_exp_month}/${payment.cc_exp_year}` : '';
            trans.creditCard = new CreditCard({
              cardExpiration,
              cardHolder: `${customer.firstname} ${customer.lastname}`,
              creditCardBin: '', // Magento does not give us the full credit card number, so we cannot currently calculate the Bin (and it is not provided)
              creditCardCompany: payment.cc_type,
              creditCardNumber: payment.cc_last4,
              gateway: this.getGateway(payment),
              transactionType: ModelTools.stringToCreditCardTransactionType(magentoTrans.txn_type),
              avsResultCode: this.getAvsResultCode(payment),
              cvvResultCode: this.getCvvAvsResultCode(),
            });
          }
        }
      }
      trans.platformId = this.getPlatformId(payment);
      trans.status = this.getStatus();
      ret.push(trans);
    } catch (e) {
      this.error('Failed create Transactions', e);
    }
    return ret;
  };
}
