import { Address } from 'ns8-protect-models';
import { get } from 'lodash';
import { error } from '.';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { Address as MagentoAddress } from '@ns8/magento2-rest-client';
import { getName } from 'country-list';
import { HelperBase } from './HelperBase';

/**
 * Utility class for working with Magento Addresses
 */
export class AddressHelper extends HelperBase {
  /**
   * Attempts to convert all of the address inside a Magento Order into Protect Addresses.
   * Since addresses live in multiple places on the Magento models, some coercion is required here.
   */
  public toOrderAddresses = (): Address[] => {
    const ret: Address[] = [];
    try {
      //For now, use `any` instead of the MagentoAddress or MagentoShippingAssignment types as neither type actually matches the data returned from the API
      //This addresses the problem of Address.region sometimes being a Region object vs a string;
      //  the sometimes present`address_type`; and the inconsistencies between the billing address data vs the shipping address data.
      const addresses: any[] = [];

      //Billing Address is stored separate from the shipping address
      const billingAddress = this.MagentoOrder.billing_address as any;
      addresses.push(billingAddress);

      //In theory, there should never be more than one shipping address, as Magento's default behavior is to automatically split orders shipped to different addresses into separate, distinct Orders.
      //However, since the data is stored as an array, it is best to assume that at some point there could be more than one shipping address.
      const shipping_assignments = get(this.MagentoOrder, 'extension_attributes.shipping_assignments') || [];
      shipping_assignments.forEach((assignment) => {
        addresses.push(get(assignment, 'shipping.address'));
      });
      addresses.forEach((address) => {
        const addr = new Address({
          type: ModelTools.stringToProtectAddressType(get(address, 'address_type')),
          address1: get(address, 'street[0]'),
          address2: get(address, 'street[1]'),
          //address3: We don't have a slot for any of the additional address information that could be present.
          //TODO: iterate over all the `street` values and concat them into `address1` and `address2`
          city: get(address, 'city'),
          company: get(address, 'company'),
          //Magento doesn't store the country, but we can compute it
          country: getName(get(address, 'country_id')),
          countryCode: get(address, 'country_id'),
          //Magento currently has no concept for these
          //latitude: 0,
          //longitude: 0,
          //name: '',
          region: get(address, 'region'),
          zip: get(address, 'postcode'),
          regionCode: get(address, 'region_code')
        });
        ret.push(addr);
      });
    } catch (e) {
      error(`Failed to create Addresses`, e);
    }
    return ret;
  }
}
