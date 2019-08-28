import { SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';
import getPlatformOrderDetails from './getPlatformOrderDetails';
import getShopifyClient from './getShopifyClient';
import sendOrderRiskTrigger from './flow/sendOrderRiskTrigger';
import setPlatformOrderRisk from './setPlatformOrderRisk';

export class ShopifyUpdateOrderRiskEventSwitch implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const { platformId } = switchContext.data;
    const client = getShopifyClient(switchContext);

    const orderDetails = await getPlatformOrderDetails(switchContext.data, client);
    const result = await client.order.update(parseInt(platformId, 10), orderDetails);

    const { 'NS8 Order Risk': risk } = orderDetails.note_attributes;
    const triggerResponse = await sendOrderRiskTrigger(switchContext, risk)
      .catch((error) => error);

    console.log('triggerResponse', triggerResponse);

    const platformOrderRisk = await setPlatformOrderRisk(switchContext, client);

    return { result, platformOrderRisk } as any;
  }
}
