import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import {
  Address,
  AddressType,
  CreditCard,
  CreditCardTransactionType,
  Customer,
  LineItem,
  Order,
  Session,
  Transaction,
  TransactionMethod,
  TransactionStatus,
} from 'ns8-protect-models';

export class Magento2CreateOrderActionSwitch implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    const { order_id }: { order_id: number } = switchContext.data;

    console.log(switchContext.merchant.domain, order_id);
    return new Order();
  }
}