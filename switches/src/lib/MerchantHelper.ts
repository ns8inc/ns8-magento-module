import { MerchantUpdate, Contact } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { Logger } from '@ns8/ns8-protect-sdk';

/**
 * Utlity method for handling merchant update events
 */
export class MerchantHelper {

  public SwitchContext: SwitchContext;

  constructor(switchContext: SwitchContext) {
    this.SwitchContext = switchContext;
  }

  public toMerchantUpdate = (): MerchantUpdate => {
    const ret = new MerchantUpdate(this.SwitchContext.merchant);
    try {
      ret.contact = new Contact(ret.contact);
      const configData = (this.SwitchContext.data.eventData && this.SwitchContext.data.eventData.configData) ?
        this.SwitchContext.data.eventData.configData :
        this.SwitchContext.data.configData;

      if (!configData || !configData.groups) return ret;

      if (configData.groups.store_information) {
        const storeInformation = configData.groups.store_information.fields;
        ret.contact.phone = storeInformation.phone.value;
        ret.contact.name = storeInformation.name.value;
        ret.name = storeInformation.name.value;
      }

      if (configData.groups.ident_general) {
        const generalIdInfo = configData.groups.ident_general.fields;
        const names: string[] = generalIdInfo.name.value.split(' ');
        ret.contact.firstName = names.shift();
        ret.contact.lastName = names.join(' ');
        ret.contact.email = generalIdInfo.email.value;
      }

      if (configData.groups.unsecure && configData.groups.secure) {
        const unsecureBaseUrl: string = configData.groups.unsecure.fields.base_url.value;
        const secureBaseUrl: string = configData.groups.secure.fields.base_url.value;
        const useSecureBaseUrl: boolean = (configData.groups.secure.fields.use_in_frontend.value === '1');
        const storefrontUrl: string = useSecureBaseUrl ? secureBaseUrl : unsecureBaseUrl;
        ret.storefrontUrl = storefrontUrl.replace(/\/$/, '');
      }

    } catch (e) {
      Logger.error(`Failed to create Merchant update event`, e);
    }
    return ret;
  }
}
