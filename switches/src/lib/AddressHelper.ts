import { Address } from 'ns8-protect-models';
import { get } from 'lodash';
import { error } from '.';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { ShippingAssignment as MagentoShippingAssignment } from '@ns8/magento2-rest-client';

// interface ShippingAssignment {
//   extension_attributes?: ParentItemClass;
//   items?: Item[];
//   shipping?: Shipping;
//   stock_id?: number;
// }

// interface Shipping {
//   address?: Address;
//   method?: string;
//   total?: Total;
//   extension_attributes?: ShippingExtensionAttributes;
// }

// interface Order {
//   billing_address: Address;
// }

// export interface Address {
//   address_type?: string;
//   city?: string;
//   company?: string;
//   country_id?: string;
//   customer_address_id?: number;
//   customer_id?: number;
//   default_billing?: boolean;
//   default_shipping?: boolean;
//   email?: string;
//   entity_id: number;
//   extension_attributes?: BillingAddressExtensionAttributes;
//   fax?: string;
//   firstname?: string;
//   lastname?: string;
//   middlename?: string;
//   parent_id: number;
//   postcode?: string;
//   prefix?: string;
//   region_code?: string;
//   region_id?: number;
//   region?: Region;
//   street?: string[];
//   suffix?: string;
//   telephone?: string;
// }

export class AddressHelper {
  private MagentoOrder: MagentoOrder;
  constructor(magentoOrder: MagentoOrder) {
    this.MagentoOrder = magentoOrder;
  }

  public toOrderAddresses = (): Address[] => {
    const addresses: MagentoShippingAssignment[] = [];
    const ret: Address[] = [];
    try {
      /*
        Grab billingAddress seperately - we then push this into an array for further formatting

        Question: Why are we casting what is allegedly an Address into a ShippingAssignment?
      */
      const billingAddress: MagentoShippingAssignment = this.MagentoOrder.billing_address as unknown as MagentoShippingAssignment;
      addresses.push(billingAddress);

      /*
        Grab billingAddress seperately - we then push this into an array for further formatting
      */
      const shipping_assignments: MagentoShippingAssignment[] =
        get<MagentoOrder, 'extension_attributes', 'shipping_assignments'>(
          this.MagentoOrder, ['extension_attributes', 'shipping_assignments']
        ) || [];
      shipping_assignments.forEach((assignment) => {
        // According to the typing address can be returned as undefined. Is this accurate?
        const shippingAssignment = get<MagentoShippingAssignment, 'shipping', 'address'>(
          assignment, ['shipping', 'address']
        );
        addresses.push(get(assignment, 'shipping.address') as MagentoShippingAssignment);
      });
      addresses.forEach((address) => {
        var addr = new Address({
          type: ModelTools.stringToProtectAddressType(get(address, 'address_type')),
          address1: get(address, 'street[0]'),
          address2: get(address, 'street[1]'),
          city: get(address, 'city'),
          company: get(address, 'company'),
          //country: '',
          countryCode: get(address, 'country_id'),
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
