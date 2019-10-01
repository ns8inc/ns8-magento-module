import { SwitchContext } from "ns8-switchboard-interfaces";
import { MagentoClient, SessionHelper } from ".";
import { Address, AddressType } from "ns8-protect-models";
import { Order, ShippingAssignment } from '@ns8/magento2-rest-client';
import { get } from 'lodash';
import { ModelTools } from '@ns8/ns8-protect-sdk';

export class AddressHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: Order;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = switchContext.data.order as Order;
  }

  public toAddresses = (): Address[] => {
    const ret: Address[] = [];
    const addresses: ShippingAssignment[] = [];

    const billingAddress = this.MagentoOrder.billing_address as unknown as ShippingAssignment;
    addresses.push(billingAddress);

    const shipping_assignments = get(this.MagentoOrder, 'extension_attributes.shipping_assignments') || [];
    shipping_assignments.forEach((assignment) => {
      addresses.push(get(assignment, 'shipping.address') as ShippingAssignment);
    })
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

    return ret;
  }

}
