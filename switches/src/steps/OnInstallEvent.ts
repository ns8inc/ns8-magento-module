import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class OnInstallEvent implements EventSwitch {
  handle = async (switchContext: SwitchContext): Promise<any> => {
    const { actions }: { actions: any } = switchContext.data;
  }
}
