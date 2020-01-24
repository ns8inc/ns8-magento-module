/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class UpdateCustVerifyStatusEventStep implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { platformId } = switchContext.data;

    return {} as any;
  }
}

export const UpdateCustVerifyStatusEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new UpdateCustVerifyStatusEventStep()]).handle)();
