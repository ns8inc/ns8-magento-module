import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import { Order, Customer, Address, Session, AddressType } from 'ns8-protect-models';
import { RestClient, Order as MagentoOrder } from '@ns8/magento2-rest-client';

export class CreateOrder implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {

    const order: MagentoOrder = switchContext.data.order as MagentoOrder;

    return new Order({
      name: `#${order.entity_id}`,
      currency: order.order_currency_code,
      merchantId: switchContext.merchant.id,
      addresses: [],
      session: new Session({ id: 'f128fb4b-eeaf-46b7-9b63-1e8364c77470', ip: '69.244.160.51' }),
      platformId: `${order.entity_id}`,
      customer: new Customer({
        lastName: order.customer_firstname,
        firstName: order.customer_lastname,
        email: order.customer_email,
        id: `${order.customer_id}`
      }),
      platformCreatedAt: new Date(order.created_at),
      totalPrice: 5.0,
      transactions: [],
      lineItems: [],
      hasGiftCard: false,
      platformStatus: 'Active'
    });
  }
}
