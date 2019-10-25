import { Customer } from 'ns8-protect-models';
import { Customer as MagentoCustomer } from '@ns8/magento2-rest-client';
import { HelperBase } from './HelperBase';
import { ModelTools } from '@ns8/ns8-protect-sdk';

/**
 * Utility class for converting Magento Customer model to Protect Customer
 */
export class CustomerHelper extends HelperBase {
  /**
   * Get the Protect gender identifier based on the data from Magento.
   * NOTE: we should probably add support for the more nuanced (non-binary) concepts of gender!
   * Magento represents `Male` as `1` and `Female` as `2`. Absent a platform extension to expand on these, there does not seem to be any other options.
   */
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

  /**
   * Attempt to parse a phone number into a standardized format.
   * NOTE: this format phone number logic is pulled directly from V1. We may or may not wish to keep it.
   */
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
        phoneNumber = ModelTools.formatPhoneNumber(defaultAddress.telephone) || '';
      }
    }
    return phoneNumber;
  }

  /**
   * Converts a Magento Customer to a Protect customer
   */
  public toCustomer = async (): Promise<Customer> => {
    let ret: Customer = new Customer();
    try {
      let customer: MagentoCustomer | null = null;
      // If a user is creating an order as a guest, the order will not have a customer id
      if (this.MagentoOrder.customer_id > 0) {
        customer = await this.MagentoClient.getCustomer(this.MagentoOrder.customer_id);
      }
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
        //Protect throws an error when trying to assign a value to birthday.
        //TODO: investigate and restore this
        //birthday: Utilities.toDate(customer.dob),
        email: customer.email,
        firstName: customer.firstname,
        gender: this.getGender(customer.gender),
        lastName: customer.lastname,
        phone: this.getPhoneNumber(customer),
        platformId: `${customer.id}`
      });
    } catch (e) {
      this.error(`Failed to create Customer`, e);
    }

    return ret;
  }

}
