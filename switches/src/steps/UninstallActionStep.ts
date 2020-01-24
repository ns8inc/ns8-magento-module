/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UninstallActionSwitch } from 'ns8-switchboard-interfaces';

export class UninstallActionStep implements UninstallActionSwitch {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async uninstall(switchContext: SwitchContext): Promise<void> {}
}

export const UninstallAction: (event: any) => Promise<any> = ((): any =>
  new operatorModule.UninstallActionOperator([new UninstallActionStep()]).handle)();
