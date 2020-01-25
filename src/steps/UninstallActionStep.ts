/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UninstallActionSwitch } from 'ns8-switchboard-interfaces';

/**
 * This is the stateless function that will execute the actual Magento switch logic.
 */
export class UninstallActionStep implements UninstallActionSwitch {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async uninstall(switchContext: SwitchContext): Promise<void> {}
}

/**
 * This is the lambda that will execute the the step function.
 * This is the method that the serverless context will execute,
 * where this method name must match the corresponding method defined in `serverless.yml`
 */
export const UninstallAction: (event: any) => Promise<any> = ((): any =>
  new operatorModule.UninstallActionOperator([new UninstallActionStep()]).handle)();
