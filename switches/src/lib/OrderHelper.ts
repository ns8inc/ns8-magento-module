import { Order, Status } from 'ns8-protect-models';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import {
  MagentoClient,
  SessionHelper,
  AddressHelper,
  TransactionHelper,
  LineItemsHelper,
  CustomerHelper,
  log
} from '.';

/**
 * Utility class for working with Magento Orders
 */
export class OrderHelper {
  private MagentoOrder: MagentoOrder;
  private Order: Order;
  private SwitchContext: SwitchContext;

  //Helper classes
  private AddressHelper: AddressHelper;
  private CustomerHelper: CustomerHelper;
  private LineItemsHelper: LineItemsHelper;
  private MagentoClient: MagentoClient;
  private SessionHelper: SessionHelper;
  private TransactionHelper: TransactionHelper;

  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
    this.MagentoClient = new MagentoClient(this.SwitchContext);
  }

  /**
   * Determines whether or not to process this order
   */
  public process = (): Boolean => {
    return true;
  }

  private init = async (): Promise<MagentoOrder> => {
    const order = await this.MagentoClient.getOrder(this.SwitchContext.data.order.entity_id);
    if (null === order) throw new Error(`No Magento order could be loaded by order id ${this.SwitchContext.data.entity_id}`)
    this.MagentoOrder = order;

    this.AddressHelper = new AddressHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.CustomerHelper = new CustomerHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.LineItemsHelper = new LineItemsHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.SessionHelper = new SessionHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.TransactionHelper = new TransactionHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);

    return this.MagentoOrder;
  }

  /**
   * Converts a Magento Order into a Protect Order
   */
  public toOrder = async (): Promise<Order> => {

    this.Order = new Order();
    try {
      const magentoOrder = await this.init();
      this.Order = new Order({
        name: `#${magentoOrder.entity_id}`,
        currency: magentoOrder.order_currency_code,
        merchantId: this.SwitchContext.merchant.id,
        session: this.SessionHelper.toSession(),
        addresses: this.AddressHelper.toOrderAddresses(),
        platformId: `${magentoOrder.entity_id}`,
        platformCreatedAt: new Date(magentoOrder.created_at),
        transactions: await this.TransactionHelper.toTransactions(),
        lineItems: this.LineItemsHelper.toLineItems(),
        createdAt: new Date(magentoOrder.created_at),
        customer: await this.CustomerHelper.toCustomer(),
        hasGiftCard: false,
        platformStatus: '', //TODO: what is this?
        totalPrice: magentoOrder.base_grand_total,
        updatedAt: new Date(magentoOrder.updated_at)
      });
    } catch (e) {
      log('Failed to create order', e);
    }

    return this.Order;
  }
}
