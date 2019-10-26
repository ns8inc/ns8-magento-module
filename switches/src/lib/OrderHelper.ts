import {
  AddressHelper,
  CustomerHelper,
  LineItemsHelper,
  MagentoClient,
  OrderActionData,
  ProtectOrderUpdateStatus,
  SessionHelper,
  TransactionHelper
} from '..';
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

  protected _ready: Promise<MagentoOrder>;
  private _orderId: number;
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
  public process = (state: ProtectOrderUpdateStatus): Boolean => {
    switch (state) {
      case ProtectOrderUpdateStatus.CREATED:
        return this.SwitchContext.data.order.status === 'pending' || this.SwitchContext.data.state === 'new';
      default:
        return true;
    }
  }

  /**
   * Attempts to get the Magento order ID.
   * NOTE: there is significant confusion around the difference between the `entity_id`, `id` and `increment_id` concepts as Magento provides different and sometimes conflicting ID representations of the same entity.
   * @see https://magento.stackexchange.com/questions/26250/confusion-with-order-id-order-increment-id-and-i-am-not-getting-order-id-as-200
   * The `entity_id` is the canonical database id of the order row in the `sales_order` table. This id should be used for the majority of API calls.
   * The `increment_id` is the **Display** Id, exposed via the Magento Admin UI and through the Customer UI. This Id will displayed consistently throughout the UI, and it will not match the underlying canonical database id.
   * The format for `increment_id` is determined by the unique store id under which the order was placed. The assumption is that any Magento instance could have multiple stores, so you would end up with display ids that would provide some guidance to the store associated with the order.
   * For the purposes of calling the Magento API, in almost all cases we want to use the `entity_id`. For display purposes, we also need to store the `increment_id` for use in PHP tables, etc.
   * We will store the Protect Order's `name` as the `increment_id` and assign `platformId` as the `entity_id`.
   */
  public getOrderId = (): number | undefined => {
    if (this._orderId) return this._orderId;

    let ret: number | undefined;
    const data = this.SwitchContext.data;
    if (data) {
      if (data.order) {
        if (data.order.entity_id) {
          ret = parseInt(data.order.entity_id);
        }
      }
      if (!ret && data.platformId) {
        //We control the `platformId`; it should be correct if we have already set it
        ret = parseInt(data.platformId);
      }
    }
    if (ret) this._orderId = ret;
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
    if (null === order) throw new Error(`Order "${this.SwitchContext.data.order.increment_id}" could be loaded by entity_id: ${orderId}`)
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
      if (!this.process(ProtectOrderUpdateStatus.CREATED)) {
        throw new Error('Cannot call Create Order unless the order is new.');
      }
      const orderId = this.getOrderId();
      const magentoOrderData = this.SwitchContext.data as OrderActionData;
      this.Order = new Order({
        name: magentoOrderData.order.increment_id,
        currency: this.MagentoOrder.order_currency_code,
        merchantId: this.SwitchContext.merchant.id,
        session: this.SessionHelper.toSession(),
        addresses: this.AddressHelper.toOrderAddresses(),
        platformId: `${orderId}`,
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
