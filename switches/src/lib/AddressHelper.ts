import { SwitchContext } from "ns8-switchboard-interfaces";
import { MagentoClient, SessionHelper } from ".";
import { Address } from "ns8-protect-models";
import { Order } from '@ns8/magento2-rest-client';
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
    this.MagentoOrder.extension_attributes.shipping_assignments.forEach((assignment) => {
      var address = new Address({
        type: ModelTools.stringToProtectAddressType(get(assignment, 'shipping.address.address_type')),
        address1: get(assignment, 'shipping.address.street[0]'),
        address2: get(assignment, 'shipping.address.street[1]'),
        city: get(assignment, 'shipping.address.city'),
        company: get(assignment, 'shipping.address.company'),
        //country: '',
        countryCode: get(assignment, 'shipping.address.country_id'),
        //latitude: 0,
        //longitude: 0,
        //name: '',
        region: get(assignment, 'shipping.address.region'),
        zip: get(assignment, 'shipping.address.postcode'),
        regionCode: get(assignment, 'shipping.address.region_code')
      });
      ret.push(address);
    });

    return ret;
  }

}
