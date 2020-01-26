import { Logger } from '@ns8/ns8-protect-sdk';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { OrderState as MagentoOrderState } from '@ns8/magento2-rest-client';
import { Status } from 'ns8-protect-models';
import { StatusHistory } from '@ns8/magento2-rest-client';
import { OrderHelper } from './OrderHelper';
import { OrderActionData } from '../models/OrderActionData';
import { isValidMagentoState, ProtectOrderState } from './utils';
import { OrderUpdateEventData } from '../models/OrderUpdateEventData';

/**
 * Utility class for working with Protect Named Order Updates
 */
export class OrderUpdateHelper extends OrderHelper {
  /**
   * This will process the Switchboard Context for an Order Update Action and then execute the necessary steps to handle the Order.
   * This executes in response to Order changes **from** Magento. The Magento side Action triggers this step function logic.
   */
  public processOrderUpdateAction = async (): Promise<NamedOrderUpdate> => {
    const ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const data = this.SwitchContext.data as OrderActionData;
      ret.platformStatus = data.order.status;
      ret.orderName = data.order.increment_id;

      if (!isValidMagentoState(data.order.state)) {
        throw new Error(`The state of this order (${data.order.status}) is not recognized.`);
      }
      // We currently have only 3 concepts on the Protect side for Order status: Canceled, Approved and Merchant Review
      // This attempts to normalize the multitude of states an order can have from within Magento into our very narrow concepts.
      if (data.order.state === MagentoOrderState.CANCELED || data.order.state === MagentoOrderState.CLOSED) {
        // Cancelled indicates the order has been proactively cancelled. Closed indicates the order is terminated and the customer has been refunded.
        ret.status = Status.CANCELLED;
      } else if (data.order.state === MagentoOrderState.COMPLETE) {
        // If the order is complete, then the merchant has approved it.
        ret.status = Status.APPROVED;
      } else {
        // All other Magento statuses indicate the order is pending or on hold.
        ret.status = Status.MERCHANT_REVIEW;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  };

  /**
   * This will process the Switchboard Context for an Order Update Event and then execute the necessary steps to handle the Order.
   * This executes in response to order rules defined in Protect. This executes in response to Protect's assessment of the order, according to the rules defined.
   * The expected outcome of this function is to update Magento in accordance with the define rule logic.
   */
  public processOrderUpdateEvent = async (): Promise<NamedOrderUpdate> => {
    const ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const magentoOrder = await this.getMagentoOrder();

      // If the order has already been terminated, refunded or fulfilled,
      // then do nothing.
      if (
        magentoOrder.state === MagentoOrderState.CANCELED ||
        magentoOrder.state === MagentoOrderState.CLOSED ||
        magentoOrder.state === MagentoOrderState.COMPLETE
      ) {
        return ret;
      }

      const data = this.SwitchContext.data as OrderUpdateEventData;

      ret.status = data.status;
      ret.orderName = data.name;

      const comment: StatusHistory = {
        created_at: new Date(),
        status: data.status,
        comment: '',
      };

      switch (data.status) {
        case Status.CANCELLED:
          try {
            await this.MagentoClient.cancelOrder(magentoOrder.entity_id);
          } catch (e) {
            Logger.error('Failed to cancel order', e);
          }
          ret.platformStatus = MagentoOrderState.CANCELED;
          comment.comment = 'NS8 Protect Order Cancelled';
          comment.status = MagentoOrderState.CANCELED;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, comment);
          break;
        case Status.APPROVED:
          if (magentoOrder.state === MagentoOrderState.ON_HOLD) {
            // There are various ways this can fail; try for now and move on if we don't succeed
            try {
              await this.MagentoClient.unholdOrder(magentoOrder.entity_id);
            } catch (e) {
              Logger.error('Failed to unhold order', e);
            }
          }
          ret.platformStatus = ProtectOrderState.APPROVED;
          comment.comment = 'NS8 Protect Order Approved';
          comment.status = ProtectOrderState.APPROVED;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, comment);
          break;
        case Status.MERCHANT_REVIEW:
          if (magentoOrder.state !== MagentoOrderState.ON_HOLD) {
            // There are various ways this can fail; try for now and move on if we don't succeed
            try {
              await this.MagentoClient.holdOrder(magentoOrder.entity_id);
            } catch (e) {
              Logger.error('Failed to hold order', e);
            }
          }
          ret.platformStatus = ProtectOrderState.MERCHANT_REVIEW;
          comment.comment = 'NS8 Protect Order Requires Review';
          comment.status = ProtectOrderState.MERCHANT_REVIEW;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, comment);
          break;
        default:
          break;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  };
}
