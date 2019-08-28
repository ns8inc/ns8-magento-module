import { SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';
import getPlatformOrderDetails from './getPlatformOrderDetails';
import getShopifyClient from './getShopifyClient';
import sendCustomerVerificationTrigger from './flow/sendCustomerVerificationTrigger';

export class ShopifyUpdateCustomerVerificationStatusEventSwitch implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const { platformId } = switchContext.data;
    const client = getShopifyClient(switchContext);

    const orderDetails = await getPlatformOrderDetails(switchContext.data, client);
    const result = await client.order.update(parseInt(platformId, 10), orderDetails);

    const { 'NS8 Customer Verification': status } = orderDetails.note_attributes;
    const triggerResponse = await sendCustomerVerificationTrigger(switchContext, status)
      .catch((error) => error);

    console.log('triggerResponse', triggerResponse);

    return { result } as any;
  }
}
