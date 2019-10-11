import { Address } from 'ns8-protect-models';
import { get } from 'lodash';
import { error, MagentoClient } from '.';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { ShippingAssignment as MagentoShippingAssignment, } from '@ns8/magento2-rest-client';
import { getName } from 'country-list';

/**
 * Utility class for working with Magento Addresses
 */
export class AddressHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: MagentoOrder;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: MagentoOrder) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  /**
   * Attempts to convert all of the address inside a Magento Order into Protect Addresses.
   * Since addresses live in multiple places on the Magento models, some coersion is required here.
   */
  public toOrderAddresses = (): Address[] => {
    const ret: Address[] = [];
    try {
      const addresses: MagentoShippingAssignment[] = [];

      //Billing Address is stored separate from the shipping address
      const billingAddress = this.MagentoOrder.billing_address as unknown as MagentoShippingAssignment;
      addresses.push(billingAddress);

      //In theory, there should never be more than one shipping address, as Magento's default behavior is to automatically split orders shipped to different addresses into separate, distinct Orders.
      //However, since the data is stored as an array, it is best to assume that at some point there could be more than one shipping address.
      const shipping_assignments = get(this.MagentoOrder, 'extension_attributes.shipping_assignments') || [];
      shipping_assignments.forEach((assignment) => {
        addresses.push(get(assignment, 'shipping.address') as MagentoShippingAssignment);
      });
      addresses.forEach((address) => {
        var addr = new Address({
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
