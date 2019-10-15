import { Logger } from '@ns8/ns8-protect-sdk';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { OrderHelper } from './OrderHelper';
import { Status } from 'ns8-protect-models';
import { StatusHistory as MagentoComment } from '@ns8/magento2-rest-client';
import { OrderActionData } from '..';
import { OrderUpdateEventData } from '../models';
/**
 * Utility class for working with Protect Named Order Updates
 */
export class NamedOrderHelper extends OrderHelper {

  /**
   * This will process the Switchboard Context for an Order Update Action and then execute the necessary steps to handle the Order.
   */
  public processOrderUpdateAction = async (): Promise<NamedOrderUpdate> => {
    let ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const data = this.SwitchContext.data as OrderActionData;

      switch (data.order.status.toLowerCase().trim()) {
        case 'cancelled':
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
      Logger.error('Failed to get named order', e);
    }
    return ret;
  }

  /**
   * This will process the Switchboard Context for an Order Update Event and then execute the necessary steps to handle the Order.
   */
  public processOrderUpdateEvent = async (): Promise<NamedOrderUpdate> => {
    let ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const magentoOrder = await this.getMagentoOrder();
      const data = this.SwitchContext.data as OrderUpdateEventData;

      switch (data.status.toLowerCase().trim()) {
        case 'cancelled':
          await this.MagentoClient.cancelOrder(magentoOrder.entity_id);
          ret = {
            status: Status.CANCELLED,
            platformStatus: 'Canceled',
            orderName: name,
          };
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Cancelled' } as MagentoComment);
          break;
        default:
          //TBD
          ret = {
            status: Status.APPROVED,
            platformStatus: 'Approved',
            orderName: name,
          };
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Approved' } as MagentoComment);
          break;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  }
}
