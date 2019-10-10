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

/**
 * Utility class for working with Protect Named Order Updates
 */
export class NamedOrderHelper {
  private MagentoOrder: MagentoOrder;
  private Order: Order;
  private SwitchContext: SwitchContext;

  //Helper classes
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
    this.MagentoClient = new MagentoClient(this.SwitchContext);
  }

  public getNamedOrderUpdate = async (): Promise<NamedOrderUpdate> => {
    let ret: NamedOrderUpdate = {} as NamedOrderUpdate;
    try {
      const {
        data: {
          cancelled_at,
          cancel_reason,
          financial_status,
          fulfillment_status,
          name,
        },
        merchant: {
          profile: {
            interceptPaymentCapture,
          },
        },
      } = this.SwitchContext;

      if (interceptPaymentCapture === InterceptOption.BEFORE && financial_status === 'paid') {
        ret = {
          status: Status.APPROVED,
          platformStatus: 'Approved',
          orderName: name,
        };
      }

      if (interceptPaymentCapture === InterceptOption.AFTER && fulfillment_status === 'fulfilled') {
        ret = {
          status: Status.APPROVED,
          platformStatus: 'Approved',
          orderName: name,
        };
      }

      if (cancelled_at || cancel_reason) {
        ret = {
          status: Status.CANCELLED,
          platformStatus: 'Canceled',
          orderName: name,
        };
      }
    } catch (e) {
      error('Failed to get named order', e);
    }
    return ret;
  }
}
