/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateMerchantActionSwitch } from 'ns8-switchboard-interfaces';
import { MerchantUpdate } from 'ns8-protect-models';
import { MerchantHelper } from '../lib/MerchantHelper';

/**
 * This is the stateless function that will execute the actual Magento switch logic.
 */
export class UpdateMerchantActionStep implements UpdateMerchantActionSwitch {
  async update(switchContext: SwitchContext): Promise<MerchantUpdate> {
    const converter = new MerchantHelper(switchContext);
    return converter.toMerchantUpdate();
  }
}

/**
 * This is the lambda that will execute the the step function.
 * This is the method that the serverless context will execute,
 * where this method name must match the corresponding method defined in `serverless.yml`
 */
export const UpdateMerchantAction: (event: any) => Promise<any> = ((): any =>
  new operatorModule.UpdateMerchantActionOperator([new UpdateMerchantActionStep()]).handle)();
