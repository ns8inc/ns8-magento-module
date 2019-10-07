import { Customer } from 'ns8-protect-models';
import { Customer as MagentoCustomer } from '@ns8/magento2-rest-client';
import { MagentoClient, error } from '.';
import { ModelTools } from '@ns8/ns8-protect-sdk';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class CustomerHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: MagentoOrder;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: MagentoOrder) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  private getGender = (g: number | undefined): string => {
    switch (g) {
      case 1:
        return 'M';
      case 2:
        return 'F';
      default:
        return 'U';
    }
  }

  private getPhoneNumber = (customer: MagentoCustomer): string => {
    let phoneNumber = '';
    if (customer.addresses) {
      let defaultAddress = customer.addresses.find((a) => { a.telephone && a.default_billing === true });
      if (!defaultAddress) {
        defaultAddress = customer.addresses.find((a) => { a.telephone && a.default_shipping === true });
      }
      if (!defaultAddress) {
        defaultAddress = customer.addresses.find((a) => { a.telephone });
      }
      if (defaultAddress && defaultAddress.telephone) {
        phoneNumber = ModelTools.formatPhoneNumber(defaultAddress.telephone);
      }
    }
    return phoneNumber;
  }

  public toCustomer = async (): Promise<Customer> => {
    let ret: Customer = new Customer();
    try {
      let customer = await this.MagentoClient.getCustomer(this.MagentoOrder.customer_id);
      if (null === customer) {
        customer = {
          id: this.MagentoOrder.customer_id,
          firstname: this.MagentoOrder.customer_firstname,
          lastname: this.MagentoOrder.customer_lastname,
          email: this.MagentoOrder.customer_email,
          middlename: this.MagentoOrder.customer_middlename,
          dob: this.MagentoOrder.customer_dob,
          gender: this.MagentoOrder.customer_gender
        } as MagentoCustomer;
      }

      ret = new Customer({
        //birthday: toDate(customer.dob),
        email: customer.email,
        firstName: customer.firstname,
        gender: this.getGender(customer.gender),
        lastName: customer.lastname,
        phone: this.getPhoneNumber(customer),
        platformId: `${customer.id}`
      });
    } catch (e) {
      error(`Failed to create Customer`, e);
    }

    return ret;
  }

}
