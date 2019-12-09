import {
  SwitchContext,
  UninstallActionSwitch
} from 'ns8-switchboard-interfaces';

export class UninstallAction implements UninstallActionSwitch {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async uninstall(switchContext: SwitchContext): Promise<void> {}
}
