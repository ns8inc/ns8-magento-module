import { Address as NS8Address } from 'ns8-protect-models';
import { Address as MagentoAddress } from '@ns8/magento2-rest-client';
import { Region as MagentoRegion } from '@ns8/magento2-rest-client';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { Utilities } from '@ns8/ns8-protect-sdk';
import { HelperBase } from '..';

/**
 * Utility class for working with Magento Addresses
 */
export class AddressHelper extends HelperBase {
  private getOrderAddresses = (): MagentoAddress[] => {
    const magentoAddresses: MagentoAddress[] = [];
    const billingAddress = this.MagentoOrder.billing_address;
    magentoAddresses.push(billingAddress);

    const shippingAssignments = this.MagentoOrder.extension_attributes
      ? this.MagentoOrder.extension_attributes.shipping_assignments || []
      : [];
    shippingAssignments.forEach(assignment => {
      const newAddress = assignment.shipping
        ? assignment.shipping.address
        : undefined;
      if (newAddress) magentoAddresses.push(newAddress);
    });
    return magentoAddresses;
  };

  private getStreetInfo1 = (address: MagentoAddress): string =>
    address?.street?.[0] || '';

  private getStreetInfo2 = (address: MagentoAddress): string => {
    let address2 = '';
    const streetInfo = address.street || [];
    if (streetInfo.length > 1) {
      streetInfo.forEach((val, i) => {
        if (val && i > 0) {
          if (address2) {
            address2 += ';';
          }
          address2 += val;
        }
      });
    }
    return address2;
  };

  private getRegion = (region: MagentoRegion | string | undefined): string => {
    const ret = region && typeof region === 'object' ? region.region : region;
    return ret || '';
  };

  /**
   * Attempts to convert all of the address inside a Magento Order into Protect Addresses.
   * Since addresses live in multiple places on the Magento models, some coercion is required here.
   */
  public toOrderAddresses = (): NS8Address[] => {
    const ns8Addresses: NS8Address[] = [];

    try {
      const magentoAddresses = this.getOrderAddresses();
      magentoAddresses.forEach(address => {
        const addr = new NS8Address({
          type: ModelTools.stringToProtectAddressType(address.address_type),
          address1: this.getStreetInfo1(address),
          address2: this.getStreetInfo2(address),
          city: address.city,
          company: address.company,
          countryCode: address.country_id,
          // Magento doesn't store the country, but we can compute it
          country: Utilities.getCountryNameFromCountryCode(address.country_id),
          region: this.getRegion(address.region),
          zip: address.postcode,
          regionCode: address.region_code
          // Magento currently has no concept for these
          // latitude: 0,
          // longitude: 0,
          // name: '',
        });
        ns8Addresses.push(addr);
      });
    } catch (e) {
      this.error(`Failed to create Addresses`, e);
    }
    return ns8Addresses;
  };
}
