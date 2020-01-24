/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateMerchantActionSwitch } from 'ns8-switchboard-interfaces';
import { MerchantUpdate } from 'ns8-protect-models';
import { MerchantHelper } from '../lib/MerchantHelper';

export class UpdateMerchantActionStep implements UpdateMerchantActionSwitch {
  async update(switchContext: SwitchContext): Promise<MerchantUpdate> {
    const converter = new MerchantHelper(switchContext);
    return converter.toMerchantUpdate();
  }
}

export const UpdateMerchantAction: (event: any) => Promise<any> = ((): any =>
  new operatorModule.UpdateMerchantActionOperator([new UpdateMerchantActionStep()]).handle)();
