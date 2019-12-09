import { EventSwitch, SwitchContext } from 'ns8-switchboard-interfaces';

import { ScoreHelper } from '..';

export class UpdateOrderRiskEvent implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const converter = new ScoreHelper(switchContext);
    await converter.processScore();
    const result = await converter.getMagentoOrder();
    const protectData = switchContext.data;
    return { result, protectData } as any;
  }
}
