import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateMerchantActionSwitch } from 'ns8-switchboard-interfaces';
import { MerchantUpdate } from 'ns8-protect-models';
import { MerchantHelper } from '..';

export class UpdateMerchantAction implements UpdateMerchantActionSwitch {
  async update(switchContext: SwitchContext): Promise<MerchantUpdate> {
    const converter = new MerchantHelper(switchContext);
    return converter.toMerchantUpdate();
  }
}
