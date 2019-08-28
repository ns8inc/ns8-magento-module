import { NamedOrderUpdate, SwitchContext, UpdateOrderStatusActionSwitch } from 'ns8-switchboard-interfaces';
import { InterceptOption, Status } from 'ns8-protect-models';

export class ShopifyUpdateOrderStatusActionSwitch implements UpdateOrderStatusActionSwitch {
  async update(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
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
    } = switchContext;

    let namedOrderUpdate: NamedOrderUpdate;

    if (interceptPaymentCapture === InterceptOption.BEFORE && financial_status === 'paid') {
      namedOrderUpdate = {
        status: Status.APPROVED,
        platformStatus: 'Approved',
        orderName: name,
      };
    }

    if (interceptPaymentCapture === InterceptOption.AFTER && fulfillment_status === 'fulfilled') {
      namedOrderUpdate = {
        status: Status.APPROVED,
        platformStatus: 'Approved',
        orderName: name,
      };
    }

    if (cancelled_at || cancel_reason) {
      namedOrderUpdate = {
        status: Status.CANCELLED,
        platformStatus: 'Canceled',
        orderName: name,
      };
    }

    return namedOrderUpdate;
  }
}
