import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { OrderHelper } from '..';

export class UpdateEQ8ScoreEvent implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const converter = new OrderHelper(switchContext);
    const result = await converter.getMagentoOrder();
    const protectData = switchContext.data;
    return { result, protectData } as any;
  }
}
