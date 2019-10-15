import { Logger } from '@ns8/ns8-protect-sdk';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { OrderHelper } from './OrderHelper';
import { Status } from 'ns8-protect-models';
import { StatusHistory as MagentoComment } from '@ns8/magento2-rest-client';
import { OrderActionData } from '..';
import { OrderUpdateEventData } from '../models';
import { MagentoStatus, MagentoState, isValidMagentoStatus, isValidMagentoState } from './utils';
/**
 * Utility class for working with Protect Named Order Updates
 */
export class NamedOrderHelper extends OrderHelper {

  /**
   * This will process the Switchboard Context for an Order Update Action and then execute the necessary steps to handle the Order.
   */
  public processOrderUpdateAction = async (): Promise<NamedOrderUpdate> => {
    const ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const data = this.SwitchContext.data as OrderActionData;

      ret.platformStatus = data.order.status || data.order.state;
      ret.orderName = `#${data.order.entity_id}`;

      if (!isValidMagentoStatus(data.order.status) && !isValidMagentoState(data.order.state)) {
        throw new Error(`The status of this order (${data.order.status}) is not recognized.`);
      }
      if (
        data.order.status == MagentoStatus.CANCELED ||
        data.order.state == MagentoState.CANCELED
      ) {
        ret.status = Status.CANCELLED;
      } else if (
        data.order.status == MagentoStatus.CLOSED ||
        data.order.state == MagentoState.CLOSED ||
        data.order.status == MagentoStatus.COMPLETE ||
        data.order.state == MagentoStatus.COMPLETE
      ) {
        ret.status = Status.APPROVED;
      } else {
        ret.status = Status.MERCHANT_REVIEW;
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

      switch (data.status) {
        case Status.CANCELLED:
          await this.MagentoClient.cancelOrder(magentoOrder.entity_id);
          ret = {
            status: Status.CANCELLED,
            platformStatus: MagentoStatus.CANCELED,
            orderName: data.name,
          };
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Cancelled' } as MagentoComment);
          break;
        case Status.APPROVED:
          ret = {
            status: Status.APPROVED,
            platformStatus: MagentoStatus.,
            orderName: name,
          };
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Approved' } as MagentoComment);
          break;
        case Status.MERCHANT_REVIEW:

          break;
        default:
          //TBD
          break;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  }
}
