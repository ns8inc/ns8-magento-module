import { SwitchContext, UpdateMerchantActionSwitch } from 'ns8-switchboard-interfaces';

export class UpdateMerchantAction implements UpdateMerchantActionSwitch {
  async update(switchContext: SwitchContext): Promise<any> {
    return {} as any;
  }
}
