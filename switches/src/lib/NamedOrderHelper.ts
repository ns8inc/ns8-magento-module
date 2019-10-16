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
   * This executes in response to Order changes **from** Magento. The Magento side Action triggers this step function logic.
   */
  public processOrderUpdateAction = async (): Promise<NamedOrderUpdate> => {
    const ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const data = this.SwitchContext.data as OrderActionData;
      ret.platformStatus = data.order.status || data.order.state;
      ret.orderName = data.order.increment_id;

      if (!isValidMagentoStatus(data.order.status) && !isValidMagentoState(data.order.state)) {
        throw new Error(`The status of this order (${data.order.status}) is not recognized.`);
      }
      //We currently have only 3 concepts on the Protect side for Order status: Canceled, Approved and Merchant Review
      //This attempts to normalize the multitude of states an order can have from within Magento into our very narrow concepts.
      if (
        data.order.status == MagentoStatus.CANCELED ||
        data.order.state == MagentoState.CANCELED
      ) {
        //Explicit cancellation is obvious. Canceled = Canceled.
        ret.status = Status.CANCELLED;
      } else if (
        data.order.status == MagentoStatus.CLOSED ||
        data.order.state == MagentoState.CLOSED ||
        data.order.status == MagentoStatus.COMPLETE ||
        data.order.state == MagentoStatus.COMPLETE
      ) {
        //Closed vs Complete is somewhat ambiguous. In either case, the order is done--but was not explicitly terminated.
        ret.status = Status.APPROVED;
      } else {
        //Everything else in Magento status land means the order is still in a state of review.
        ret.status = Status.MERCHANT_REVIEW;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  }

  /**
   * This will process the Switchboard Context for an Order Update Event and then execute the necessary steps to handle the Order.
   * This executes in response to order rules defined in Protect. This executes in response to Protect's assessment of the order, according to the rules defined.
   * The expected outcome of this function is to update Magento in accordance with the define rule logic.
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
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, 'NS8 Protect Order Cancelled');
          break;
        case Status.APPROVED:
          //Not entirely clear what, if anything we need to do in this case. I think it's safe to assume the order is still pending in Magento.
          ret.platformStatus = MagentoStatus.PENDING;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, 'NS8 Protect Order Approved');
          break;
        case Status.MERCHANT_REVIEW:
          ret.platformStatus = MagentoStatus.PENDING;
          await this.MagentoClient.postOrderComment(magentoOrder.entity_id, 'NS8 Protect Order Requires Review');
          break;
      }
    } catch (e) {
      Logger.error('Failed to get named order', e);
    }
    return ret;
  }
}
