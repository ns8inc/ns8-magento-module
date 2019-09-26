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
  CustomerVerificationHelper,
  FraudAssessmentHelper
} from '.';

/**
 * Utility class for working with Magento Orders
 */
export class OrderHelper {
  private MagentoOrder: MagentoOrder;
  private Order: Order;
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private SessionHelper: SessionHelper;
  private AddressHelper: AddressHelper;
  private TransactionHelper: TransactionHelper;
  private LineItemsHelper: LineItemsHelper;
  private CustomerHelper: CustomerHelper;
  private CustomerVerificationHelper: CustomerVerificationHelper;
  private FraudAssessmentHelper: FraudAssessmentHelper;

  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
    this.MagentoClient = new MagentoClient(this.SwitchContext);
    this.SessionHelper = new SessionHelper(this.SwitchContext, this.MagentoClient);
    this.AddressHelper = new AddressHelper(this.SwitchContext, this.MagentoClient);
    this.TransactionHelper = new TransactionHelper(this.SwitchContext, this.MagentoClient);
    this.CustomerHelper = new CustomerHelper(this.SwitchContext, this.MagentoClient);
    this.CustomerVerificationHelper = new CustomerVerificationHelper(this.SwitchContext, this.MagentoClient);
    this.FraudAssessmentHelper = new FraudAssessmentHelper(this.SwitchContext, this.MagentoClient);
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
      addresses: this.AddressHelper.toAddresses(),
      platformId: `${magentoOrder.entity_id}`,
      platformCreatedAt: new Date(magentoOrder.created_at),
      transactions: this.TransactionHelper.toTransactions(),
      lineItems: this.LineItemsHelper.toLineItems(),
      createdAt: new Date(magentoOrder.created_at),
      customer: this.CustomerHelper.toCustomer(),
      id: '',
      hasGiftCard: false,
      customerVerification: this.CustomerVerificationHelper.toCustomerVerification(),
      platformStatus: '',
      fraudAssessments: this.FraudAssessmentHelper.toFraudAssessment(),
      totalPrice: 0,
      updatedAt: new Date(magentoOrder.updated_at)
    });

    return this.Order;
  }
}
