import { MerchantUpdate, Contact } from 'ns8-protect-models';
import { MerchantUpdate as MagentoMerchantUpdate } from '@ns8/magento2-rest-client';
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
      const configData: MagentoMerchantUpdate | undefined = (this.SwitchContext.data.eventData && this.SwitchContext.data.eventData.configData) ?
        this.SwitchContext.data.eventData.configData :
        this.SwitchContext.data.configData;

      if (!configData || !configData.groups) return ret;

      if (configData.groups.store_information && configData.groups.store_information.fields) {
        const storeInformation = configData.groups.store_information.fields;
        ret.contact.phone = (storeInformation.phone) ? storeInformation.phone.value : undefined;
        ret.contact.name = (storeInformation.name) ? storeInformation.name.value : undefined;
        ret.name = (storeInformation.name) ? storeInformation.name.value : undefined;
      }

      if (configData.groups.ident_general && configData.groups.ident_general.fields) {
        const generalIdInfo = configData.groups.ident_general.fields;
        const names: string[] = (generalIdInfo.name && generalIdInfo.name.value) ? generalIdInfo.name.value.split(' ') : [];
        ret.contact.firstName = names.shift();
        ret.contact.lastName = names.join(' ');
        ret.contact.email = (generalIdInfo.email) ? generalIdInfo.email.value : undefined;
      }

      if ((configData.groups.unsecure && configData.groups.unsecure.fields) || (configData.groups.secure && configData.groups.secure.fields)) {
        const unsecureBaseUrl: string | undefined = (configData.groups.unsecure &&
          configData.groups.unsecure.fields &&
          configData.groups.unsecure.fields.base_url) ?
          configData.groups.unsecure.fields.base_url.value : undefined;
        const secureBaseUrl: string | undefined = (configData.groups.secure &&
          configData.groups.secure.fields &&
          configData.groups.secure.fields.base_url) ?
          configData.groups.secure.fields.base_url.value : undefined;
        const useSecureBaseUrl: boolean | undefined = (configData.groups.secure &&
          configData.groups.secure.fields &&
          configData.groups.secure.fields.use_in_frontend &&
          configData.groups.secure.fields.use_in_frontend.value === '1');
        const storefrontUrl: string | undefined = useSecureBaseUrl ? secureBaseUrl : unsecureBaseUrl;
        if (storefrontUrl) {
          ret.storefrontUrl = storefrontUrl.replace(/\/$/, '');
        }
      }
    } catch (e) {
      Logger.error(`Failed to create Merchant update event`, e);
    }
    return ret;
  }
}
