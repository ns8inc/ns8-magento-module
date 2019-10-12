import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { OrderHelper } from './OrderHelper';
import { Status } from 'ns8-protect-models';
import {
  error,
  } from '.';

/**
 * Utility class for working with Protect Named Order Updates
 */
export class NamedOrderHelper extends OrderHelper {

  /**
   * This will process the Switchboard Context for an Order Update event/action and then execute the necessary steps to handle the Order.
   */
  public processOrderUpdate = async (): Promise<NamedOrderUpdate> => {
    let ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const magentoOrder = await this.getMagentoOrder();
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
