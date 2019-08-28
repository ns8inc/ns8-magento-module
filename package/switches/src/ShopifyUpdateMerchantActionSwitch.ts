import { SwitchContext, UpdateMerchantActionSwitch } from 'ns8-switchboard-interfaces';

export class ShopifyUpdateMerchantActionSwitch implements UpdateMerchantActionSwitch {
  async update(switchContext: SwitchContext): Promise<any> {
    console.log('ShopifyUpdateMerchantActionSwitch.update()', switchContext);
    return {} as any;
  }
}
