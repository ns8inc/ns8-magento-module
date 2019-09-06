import {
  CreateOrderActionSwitch as ICreateOrderActionSwitch,
  SwitchContext as ISwitchContext
} from 'ns8-switchboard-interfaces';
import { Order, Customer, Address, Session, AddressType } from 'ns8-protect-models';

export class CreateOrderActionSwitch implements ICreateOrderActionSwitch {
  async create(switchContext: ISwitchContext): Promise<Order> {
    console.log(switchContext);
    if (switchContext.data.order.status != 'pending' && switchContext.data.order.state != 'new') return;

    return new Order({
      name: `#${switchContext.data.order.entity_id}`,
      currency: switchContext.data.order.order_currency_code,
      merchantId: switchContext.merchant.id,
      addresses: [],
      session: new Session({ id: 'f128fb4b-eeaf-46b7-9b63-1e8364c77470', ip: '69.244.160.51' }),
      platformId: switchContext.data.order.entity_id,
      customer: new Customer({
        lastName: switchContext.data.order.customer_firstname,
        firstName: switchContext.data.order.customer_lastname,
        email: switchContext.data.order.customer_email,
        id: switchContext.data.order.customer_id
      }),
      platformCreatedAt: new Date(switchContext.data.order.created_at),
      totalPrice: 5.0,
      transactions: [],
      lineItems: [],
      hasGiftCard: false,
      platformStatus: 'Active',
    });
  }
}