import { Contact, MerchantUpdate } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export function toProtectMerchantUpdate(magentoUpdateSwitchContext: SwitchContext) {
  const configData = magentoUpdateSwitchContext.data.configData;
  const contact: Contact = new Contact(magentoUpdateSwitchContext.merchant.contact);
  let merchantName: string = magentoUpdateSwitchContext.merchant.name;

  if (configData.groups.store_information) {
    const storeInformation = configData.groups.store_information.fields;
    contact.phone = storeInformation.phone.value;
    contact.name = storeInformation.name.value;
    merchantName = storeInformation.name.value;
  }

  if (configData.groups.ident_general) {
    const generalIdInfo = configData.groups.ident_general.fields;
    const names: string[] = generalIdInfo.name.value.split(' ');
    contact.firstName = names.shift();
    contact.lastName = names.join(' ');
    contact.email = generalIdInfo.email.value;
  }

  return new MerchantUpdate({
    contact: contact,
    name: merchantName,
    status: magentoUpdateSwitchContext.merchant.status
  });
}
