import { Order, Customer, Address, Session, AddressType } from 'ns8-protect-models';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { MagentoClient } from '.';
import { SessionHelper } from './SessionHelper';

/**
 * Utility class for working with Magento Orders
 */
export class OrderHelper {
  private MagentoOrder: MagentoOrder;
  private Order: Order;
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private SessionHelper: SessionHelper;

  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
    this.MagentoClient = new MagentoClient(this.SwitchContext);
    this.SessionHelper = new SessionHelper(this.SwitchContext, this.MagentoClient);
    this.MagentoOrder = switchContext.data.order as MagentoOrder;
  }

  /**
   * Determines whether or not to process this order
   */
  public process = (): Boolean => {
    return true;
  }

  /**
   * Converts a Magento Order into a Protect Order
   */
  public toOrder = async ():Promise<Order> => {
    if (this.Order) return this.Order;

    const magentoOrder: MagentoOrder = await this.MagentoClient.getOrder(this.MagentoOrder.entity_id);
    this.Order = new Order({
      name: `#${magentoOrder.entity_id}`,
      currency: magentoOrder.order_currency_code,
      merchantId: this.SwitchContext.merchant.id,
      session: this.SessionHelper.toSession(),
      addresses: [],
      platformId: `${magentoOrder.entity_id}`,
      platformCreatedAt: new Date(magentoOrder.created_at),
      transactions: [],
      lineItems: []
    });

    return this.Order;
  }
}
