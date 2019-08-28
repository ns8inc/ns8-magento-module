import { SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';
import getPlatformOrderDetails from './getPlatformOrderDetails';
import getShopifyClient from './getShopifyClient';
import sendEQ8ScoreTrigger from './flow/sendEQ8ScoreTrigger';

export class ShopifyUpdateEQ8ScoreEventSwitch implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const { platformId } = switchContext.data;
    const client = getShopifyClient(switchContext);

    const orderDetails = await getPlatformOrderDetails(switchContext.data, client);
    const result = await client.order.update(parseInt(platformId, 10), orderDetails);

    const { 'NS8 EQ8 Score': score } = orderDetails.note_attributes;
    const triggerResponse = await sendEQ8ScoreTrigger(switchContext, parseInt(score, 10))
      .catch((error) => error);

    console.log('triggerResponse', triggerResponse);

    return { result } as any;
  }
}
