import {
  AddressHelper,
  CustomerHelper,
  error,
  LineItemsHelper,
  MagentoClient,
  OrderState,
  SessionHelper,
  TransactionHelper
  } from '.';
import { get } from 'lodash';
import { Order } from 'ns8-protect-models';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';

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
  public process = (state: OrderState): Boolean => {
    switch (state) {
      case OrderState.CREATED:
        return this.SwitchContext.data.order.status === 'pending' || this.SwitchContext.data.state === 'new';
      default:
        return true;
    }
  }

  private init = async (): Promise<MagentoOrder> => {
    const orderId = get(this.SwitchContext, 'data.order.entity_id') || get(this.SwitchContext, 'data.platformId');
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
   * Converts a Magento Order into a Protect Order
   */
  public createProtectOrder = async (): Promise<Order> => {
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
      error('Failed to create order', e);
    }

    return this.Order;
  }

  public getMagentoOrder = async (): Promise<MagentoOrder> => {
    let ret: MagentoOrder = {} as MagentoOrder;
    try {
      ret = await this.init();
    } catch (e) {
      error('Failed to get order', e);
    }
    return ret;
  }
}
