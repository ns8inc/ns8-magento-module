import * as Shopify from 'shopify-api-node';
import { NamedOrderUpdate, SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';
import getPlatformOrderDetails from './getPlatformOrderDetails';
import getShopifyClient from './getShopifyClient';
import cancelShopifyOrder from './cancelShopifyOrder';
import capturePayment from './capturePayment';
import fulfillOrder from './fulfillOrder';
import { InterceptOption, Status } from 'ns8-protect-models';
import sendOrderStatusTrigger from './flow/sendOrderStatusTrigger';
import { PlatformOrderDetails } from './types';

export class ShopifyUpdateOrderStatusEventSwitch implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    const {
      merchant: {
        profile,
      },
      data: {
        platformId,
        status,
        name,
      },
    } = switchContext;
    const orderId: number = parseInt(platformId, 10);
    const client: Shopify = getShopifyClient(switchContext);

    let interceptPaymentCapture: InterceptOption = InterceptOption.NEVER;
    let cancelShopifyOrderResults: string | Error;
    let paymentCaptureResults: string | Error;
    let fulfillmentResults: string | Error;
    let updateOrderResults: Shopify.IOrder | Error;
    let orderDetails: PlatformOrderDetails;

    if (profile && profile.interceptPaymentCapture) {
      interceptPaymentCapture = profile.interceptPaymentCapture;
    }

    if (status === Status.CANCELLED) {
      cancelShopifyOrderResults = await cancelShopifyOrder(client, orderId, profile.emailOnCancel);

      console.log('cancelShopifyOrderResults', cancelShopifyOrderResults.toString());
    }

    if (status === Status.APPROVED) {
      if (interceptPaymentCapture === InterceptOption.BEFORE) {
        paymentCaptureResults = await capturePayment(client, orderId);

        console.log('paymentCaptureResults', paymentCaptureResults.toString());
      }

      if (interceptPaymentCapture === InterceptOption.AFTER) {
        fulfillmentResults = await fulfillOrder(client, orderId);

        console.log('fulfillmentResults', JSON.stringify(fulfillmentResults));
      }
    }

    orderDetails = await getPlatformOrderDetails(switchContext.data, client);

    updateOrderResults = await client.order.update(orderId, orderDetails)
      .catch((error) => new Error(`Failed to update order: ${JSON.stringify(error)}`));

    console.log('updateOrderResults', JSON.stringify(updateOrderResults));

    const platformStatus = {
      APPROVED: 'Approved',
      MERCHANT_REVIEW: 'Merchant Review',
      CANCELLED: 'Canceled',
    };

    const namedOrderUpdate: NamedOrderUpdate = {
      status,
      platformStatus: platformStatus[status],
      orderName: name,
    };

    const triggerResponse = await sendOrderStatusTrigger(switchContext, namedOrderUpdate.platformStatus)
      .catch((error) => error);

    console.log('triggerResponse', JSON.stringify(triggerResponse));

    return namedOrderUpdate;
  }
}
