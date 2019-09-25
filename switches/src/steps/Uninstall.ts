import { SwitchContext, UninstallActionSwitch } from 'ns8-switchboard-interfaces';

export class Uninstall implements UninstallActionSwitch {
  async uninstall(switchContext: SwitchContext): Promise<void> { }
}
