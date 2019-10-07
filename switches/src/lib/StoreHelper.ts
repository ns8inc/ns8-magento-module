import { Contact, MerchantUpdate } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export function toProtectMerchantUpdate(magentoUpdateSwitchContext: SwitchContext) {
  return new MerchantUpdate({
    contact: new Contact({ ...magentoUpdateSwitchContext.merchant.contact, ...magentoUpdateSwitchContext.data }),
    name: magentoUpdateSwitchContext.data.name || magentoUpdateSwitchContext.merchant.name,
    status: magentoUpdateSwitchContext.merchant.status
  });
}
