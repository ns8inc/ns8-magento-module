/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class OnInstallEventStep implements EventSwitch {
  handle = async (switchContext: SwitchContext): Promise<any> => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { actions }: { actions: any } = switchContext.data;
  };
}

export const OnInstallEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new OnInstallEventStep()]).handle)();
