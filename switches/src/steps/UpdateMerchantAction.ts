import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateMerchantActionSwitch } from 'ns8-switchboard-interfaces';
import { MerchantUpdate } from 'ns8-protect-models';
import { toProtectMerchantUpdate } from '../lib';

export class UpdateMerchantAction implements UpdateMerchantActionSwitch {
  async update(switchContext: SwitchContext): Promise<MerchantUpdate> {
    return toProtectMerchantUpdate(switchContext);
  }
}
