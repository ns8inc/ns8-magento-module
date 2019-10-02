import { SwitchContext } from 'ns8-switchboard-interfaces';
import { MagentoClient, log } from '.';
import { Address, Customer } from 'ns8-protect-models';
import { Order, Customer as MagentoCustomer } from '@ns8/magento2-rest-client';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { get } from 'lodash';

export class CustomerHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: Order;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: Order) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  private getAddresses = (customer: MagentoCustomer): Address[] => {
    const ret: Address[] = [];
    try {
      if (customer && customer.addresses) {
        customer.addresses.forEach((address) => {
          var addr = new Address({
            type: ModelTools.stringToProtectAddressType(get(address, 'address_type')),
            address1: get(address, 'street[0]'),
            address2: get(address, 'street[1]'),
            city: get(address, 'city'),
            company: get(address, 'company'),
            countryCode: get(address, 'country_id'),
            region: get(address, 'region.region'),
            zip: get(address, 'postcode'),
            regionCode: get(address, 'region_code')
          });
          ret.push(addr);
        });
      }
    } catch (e) {
      log(`Failed to create Addresses`, e);
    }
    return ret;
  }

  public toCustomer = async(): Promise<Customer> => {
    let customer = await this.MagentoClient.getCustomer(this.MagentoOrder.customer_id);
    if (null === customer) {
      customer = {
        id: this.MagentoOrder.customer_id,
        firstname: this.MagentoOrder.customer_firstname,
        lastname: this.MagentoOrder.customer_lastname,
        email: this.MagentoOrder.customer_email,
        middlename: this.MagentoOrder.customer_middlename
      } as MagentoCustomer;
    }
    return new Customer({
      birthday: new Date(customer.dob)
    });
  }

}
