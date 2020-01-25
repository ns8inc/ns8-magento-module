import { Logger } from '@ns8/ns8-protect-sdk';
import { Order } from 'ns8-protect-models';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { AddressHelper } from './AddressHelper';
import { CustomerHelper } from './CustomerHelper';
import { LineItemsHelper } from './LineItemsHelper';
import { MagentoClient } from './MagentoClient';
import { TransactionHelper } from './TransactionHelper';
import { SessionHelper } from './SessionHelper';
import { OrderActionData } from '../models/OrderActionData';

/**
 * Utility class for working with Magento Orders
 */
export class OrderHelper {
  public MagentoOrder: MagentoOrder | undefined;

  public Order: Order | undefined;

  public SwitchContext: SwitchContext;

  // Helper classes
  public AddressHelper: AddressHelper | undefined;

  public CustomerHelper: CustomerHelper | undefined;

  public LineItemsHelper: LineItemsHelper | undefined;

  public MagentoClient: MagentoClient;

  public SessionHelper: SessionHelper | undefined;

  public TransactionHelper: TransactionHelper | undefined;

  protected _ready: Promise<MagentoOrder>;

  private _orderId: number | undefined;

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
    const { data } = this.SwitchContext;
    if (data) {
      if (data.order) {
        if (data.order.entity_id) {
          ret = parseInt(data.order.entity_id, 10);
        }
      }
      if (!ret && data.platformId) {
        // We control the `platformId`; it should be correct if we have already set it
        ret = parseInt(data.platformId, 10);
      }
    }
    if (ret) this._orderId = ret;
    return ret;
  };

  /**
   * Initialze this instance with the Magento Order returned from the platform API
   */
  private init = async (): Promise<MagentoOrder> => {
    if (this.MagentoOrder) return this.MagentoOrder;

    const orderId = this.getOrderId();
    if (!orderId) throw new Error(`No Magento OrderId could be found`);
    const order: MagentoOrder | null = await this.MagentoClient.getOrder(orderId);
    if (order === null)
      throw new Error(
        `Order "${
          this.SwitchContext.data.order.increment_id
        }" could not be loaded by entity_id: ${orderId} from ${this.MagentoClient.getApiUrl()}`,
      );
    this.MagentoOrder = order;

    this.AddressHelper = new AddressHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.CustomerHelper = new CustomerHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.LineItemsHelper = new LineItemsHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.SessionHelper = new SessionHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);
    this.TransactionHelper = new TransactionHelper(this.SwitchContext, this.MagentoClient, this.MagentoOrder);

    return this.MagentoOrder;
  };

  /**
   * Converts a Magento Order into a Protect Order. This should exclusively be called on Order Create.
   * This is purely a data model conversion of one DTO into another DTO.
   * The actual creation of the Order will happen when Protect receives this data.
   */
  public createProtectOrder = async (): Promise<Order> => {
    this.Order = new Order();
    try {
      const order: MagentoOrder = await this._ready;
      const orderId = this.getOrderId();
      const magentoOrderData = this.SwitchContext.data as OrderActionData;
      this.Order = new Order({
        name: magentoOrderData.order.increment_id,
        currency: order.order_currency_code,
        merchantId: this.SwitchContext.merchant.id,
        session: this.SessionHelper?.toSession(),
        addresses: this.AddressHelper?.toOrderAddresses(),
        platformId: `${orderId}`,
        platformCreatedAt: new Date(order.created_at),
        transactions: await this.TransactionHelper?.toTransactions(),
        lineItems: this.LineItemsHelper?.toLineItems(),
        createdAt: new Date(order.created_at),
        customer: await this.CustomerHelper?.toCustomer(),
        hasGiftCard: false,
        totalPrice: order.base_grand_total,
        updatedAt: new Date(order.updated_at),
      });
    } catch (e) {
      Logger.error('Failed to create order', e);
    }

    return this.Order;
  };

  /**
   * Get the Magento version of this Order
   */
  public getMagentoOrder = async (): Promise<MagentoOrder> => this._ready;
}
