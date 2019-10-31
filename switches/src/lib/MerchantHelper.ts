import { MerchantUpdate, Contact } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export function toProtectMerchantUpdate(magentoUpdateSwitchContext: SwitchContext) {
  const merchantUpdate = new MerchantUpdate(magentoUpdateSwitchContext.merchant);
  if (!merchantUpdate) return new MerchantUpdate();

  const configData = magentoUpdateSwitchContext.data.configData;

  if (configData.groups.store_information && merchantUpdate.contact) {
    const storeInformation = configData.groups.store_information.fields;
    merchantUpdate.contact.phone = storeInformation.phone.value;
    merchantUpdate.contact.name = storeInformation.name.value;
    merchantUpdate.name = storeInformation.name.value;
  }

  if (configData.groups.ident_general && merchantUpdate.contact) {
    const generalIdInfo = configData.groups.ident_general.fields;
    const names: string[] = generalIdInfo.name.value.split(' ');
    merchantUpdate.contact.firstName = names.shift();
    merchantUpdate.contact.lastName = names.join(' ');
    merchantUpdate.contact.email = generalIdInfo.email.value;
  }

  if (configData.groups.unsecure && configData.groups.secure) {
    const unsecureBaseUrl: string = configData.groups.unsecure.fields.base_url.value;
    const secureBaseUrl: string = configData.groups.secure.fields.base_url.value;
    const useSecureBaseUrl: boolean = (configData.groups.secure.fields.use_in_frontend.value === '1');
    const storefrontUrl: string = useSecureBaseUrl ? secureBaseUrl : unsecureBaseUrl;
    merchantUpdate.storefrontUrl = storefrontUrl.replace(/\/$/, '');
  }

  return merchantUpdate;
}
