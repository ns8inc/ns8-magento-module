import {
  AddressHelper,
  CustomerHelper,
  LineItemsHelper,
  MagentoClient,
  OrderState,
  SessionHelper,
  TransactionHelper
} from '.';
import { Logger } from '@ns8/ns8-protect-sdk';
import { Order } from 'ns8-protect-models';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';

/**
 * Utility class for working with Magento Orders
 */
export class OrderHelper {
  public MagentoOrder: MagentoOrder;
  public Order: Order;
  public SwitchContext: SwitchContext;

  //Helper classes
  public AddressHelper: AddressHelper;
  public CustomerHelper: CustomerHelper;
  public LineItemsHelper: LineItemsHelper;
  public MagentoClient: MagentoClient;
  public SessionHelper: SessionHelper;
  public TransactionHelper: TransactionHelper;

  private _ready: Promise<MagentoOrder>;

  /**
   * Constructor will call init() which sets a _ready Promise.
   * Any methods on this instance which require access to the Magento Order should wait on _ready.
   */
  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
    this.MagentoClient = new MagentoClient(this.SwitchContext);
    this._ready = this.init();
  }

  /**
   * Determines whether or not to process this order.
   * TODO: update this logic when we have a better understanding of status/state in Magento
   */
  public process = (state: OrderState): Boolean => {
    switch (state) {
      case OrderState.CREATED:
        return this.SwitchContext.data.order.status === 'pending' || this.SwitchContext.data.state === 'new';
      default:
        return true;
    }
  }

  private getOrderId = (): number | undefined => {
    let ret: number | undefined;
    const data = this.SwitchContext.data;
    if (data) {
      if (data.order && data.order.entity_id) {
        ret = data.order.entity_id as number;
      } else if (data.platformId) {
        ret = data.platformId as number;
      }
    }
    return ret;
  }

  /**
   * Initialze this instance with the Magento Order returned from the platform API
   */
  private init = async (): Promise<MagentoOrder> => {
    if (this.MagentoOrder) return this.MagentoOrder;

    const orderId = this.getOrderId();
    if (!orderId) throw new Error(`No Magento OrderId could be found`);
    const order: MagentoOrder | null = await this.MagentoClient.getOrder(orderId);
    if (null === order) throw new Error(`No Magento order could be loaded by order id ${orderId}`)
    this.MagentoOrder = order;

    this.AddressHelper = new AddressHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.CustomerHelper = new CustomerHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.LineItemsHelper = new LineItemsHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.SessionHelper = new SessionHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.TransactionHelper = new TransactionHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);

    return this.MagentoOrder;
  }

  /**
   * Converts a Magento Order into a Protect Order. This should exclusively be called on Order Create.
   * This is purely a data model conversion of one DTO into another DTO.
   * The actual creation of the Order will happen when Protect receives this data.
   */
  public createProtectOrder = async (): Promise<Order> => {
    this.Order = new Order();
    try {
      await this._ready;
      if (!this.process(OrderState.CREATED)) {
        throw new Error('Cannot call Create Order unless the order is new.');
      }
      this.Order = new Order({
        name: `#${this.MagentoOrder.entity_id}`,
        currency: this.MagentoOrder.order_currency_code,
        merchantId: this.SwitchContext.merchant.id,
        session: this.SessionHelper.toSession(),
        addresses: this.AddressHelper.toOrderAddresses(),
        platformId: `${this.MagentoOrder.entity_id}`,
        platformCreatedAt: new Date(this.MagentoOrder.created_at),
        transactions: await this.TransactionHelper.toTransactions(),
        lineItems: this.LineItemsHelper.toLineItems(),
        createdAt: new Date(this.MagentoOrder.created_at),
        customer: await this.CustomerHelper.toCustomer(),
        hasGiftCard: false,
        platformStatus: '', //TODO: what is this?
        totalPrice: this.MagentoOrder.base_grand_total,
        updatedAt: new Date(this.MagentoOrder.updated_at)
      });
    } catch (e) {
      Logger.error('Failed to create order', e);
    }

    return this.Order;
  }

  /**
   * Get the Magento version of this Order
   */
  public getMagentoOrder = async (): Promise<MagentoOrder> => this._ready;
}
