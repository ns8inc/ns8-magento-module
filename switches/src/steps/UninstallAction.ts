import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UninstallActionSwitch } from 'ns8-switchboard-interfaces';

export class UninstallAction implements UninstallActionSwitch {
  async uninstall(switchContext: SwitchContext): Promise<void> { }
}
