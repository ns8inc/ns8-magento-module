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
import { InterceptOption } from 'ns8-protect-models';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { Status } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { OrderHelper } from './OrderHelper';

/**
 * Utility class for working with Protect Named Order Updates
 */
export class NamedOrderHelper {
  private MagentoOrder: MagentoOrder;
  private Order: Order;
  private OrderHelper: OrderHelper;
  private SwitchContext: SwitchContext;

  //Helper classes
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
    this.MagentoClient = new MagentoClient(this.SwitchContext);
    this.OrderHelper = new OrderHelper(this.SwitchContext);
  }

  /**
   * This will process the Switchboard Context for an Order Update event/action and then execute the necessary steps to handle the Order.
   */
  public processOrderUpdate = async (): Promise<NamedOrderUpdate> => {
    let ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const magentoOrder = await this.OrderHelper.getMagentoOrder();
      const {
        data: {
          name,
          status,
        },
        merchant: {
          profile: {
            interceptPaymentCapture,
          },
        },
      } = this.SwitchContext;

      switch (status.toLowerCase().trim()) {
        case 'cancelled':
          this.MagentoClient.cancelOrder(magentoOrder.entity_id);
          ret = {
            status: Status.CANCELLED,
            platformStatus: 'Canceled',
            orderName: name,
          };
          break;
        default:
          //TBD
          ret = {
            status: Status.APPROVED,
            platformStatus: 'Approved',
            orderName: name,
          };
          break;
      }
    } catch (e) {
      error('Failed to get named order', e);
    }
    return ret;
  }
}
