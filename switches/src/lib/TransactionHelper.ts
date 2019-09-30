import { SwitchContext } from 'ns8-switchboard-interfaces';
import { MagentoClient } from '.';
import { Order } from '@ns8/magento2-rest-client';
import { Transaction, CreditCard, TransactionMethod, TransactionStatus } from 'ns8-protect-models';

export class TransactionHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: Order;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = switchContext.data.order as Order;
  }

  public toTransactions = (): Transaction[] => {
    const ret: Transaction[] = [];
    const trans = new Transaction({
      amount: 0,
      creditCard: new CreditCard(),
      currency: '',
      method: TransactionMethod.BANK_WIRE,
      platformId: '',
      processedAt: new Date(),
      status: TransactionStatus.ERROR,
      statusDetails: ''
    });
    ret.push(trans);
    this.MagentoOrder.extension_attributes.payment_additional_info.forEach((assignment) => {

    });
    return ret;
  }
}
