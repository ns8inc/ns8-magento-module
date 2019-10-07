import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class UpdateCustVerifyStatusEvent implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const { platformId } = switchContext.data;

    return {} as any;
  }
}
