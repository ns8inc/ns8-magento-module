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
      const orderId = this.getOrderId();
      ret.platformStatus = data.order.status || data.order.state;
      ret.orderName = `#${orderId}`;

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
    const ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const magentoOrder = await this.getMagentoOrder();
      const data = this.SwitchContext.data as OrderUpdateEventData;

      ret.status = data.status;
      ret.orderName = data.name;

      switch (data.status) {
        case Status.CANCELLED:
          await this.MagentoClient.cancelOrder(magentoOrder.entity_id);
          ret.platformStatus = MagentoStatus.CANCELED;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Cancelled' } as MagentoComment);
          break;
        case Status.APPROVED:
          //Not entirely clear what, if anything we need to do in this case. I think it's safe to assume the order is still pending in Magento.
          ret.platformStatus = MagentoStatus.PENDING;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Approved' } as MagentoComment);
          break;
        case Status.MERCHANT_REVIEW:
          ret.platformStatus = MagentoStatus.PENDING;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, { comment: 'NS8 Protect Order Requires Review' } as MagentoComment);
          break;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  }
}
