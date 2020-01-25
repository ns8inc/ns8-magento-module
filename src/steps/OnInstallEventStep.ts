/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

/**
 * This is the stateless function that will execute the actual Magento switch logic.
 */
export class OnInstallEventStep implements EventSwitch {
  handle = async (switchContext: SwitchContext): Promise<any> => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { actions }: { actions: any } = switchContext.data;
  };
}

/**
 * This is the lambda that will execute the the step function.
 * This is the method that the serverless context will execute,
 * where this method name must match the corresponding method defined in `serverless.yml`
 */
export const OnInstallEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new OnInstallEventStep()]).handle)();
