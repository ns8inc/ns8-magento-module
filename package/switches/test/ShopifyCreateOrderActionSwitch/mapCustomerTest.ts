import { expect } from 'chai';
import { ICustomerAddress, IOrderCustomer } from 'shopify-api-node';
import { Customer } from 'ns8-protect-models';
import { mapCustomer } from '../../src';
import { orderCustomerFromPartial, customerAddressFromPartial } from '../objectGenerators/Shopify';

describe('mapCustomer', () => {
  let defaultAddress: ICustomerAddress;
  let billingAddress: ICustomerAddress;

  beforeEach(() => {
    defaultAddress = customerAddressFromPartial({
      first_name: 'default first name',
      last_name: 'default last name',
      phone: '(333) 444-5555',
      country_code: 'US',
    });

    billingAddress = customerAddressFromPartial({
      phone: '(444) 555-6666',
      country_code: 'US',
    });
  });

  it('should create a complete Protect.Customer object', () => {
    const customer: IOrderCustomer = orderCustomerFromPartial({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'automated-tests@ns8.com',
      phone: '+15555555555',
      total_spent: '1.00',
      created_at: '2012-08-24T14:01:46-04:00',
      default_address: defaultAddress,
    });

    const mappedCustomer = mapCustomer(customer, billingAddress);

    expect(mappedCustomer).to.be.an.instanceOf(Customer);
    expect(mappedCustomer.platformId).to.equal('1');
    expect(mappedCustomer.firstName).to.equal('John');
    expect(mappedCustomer.lastName).to.equal('Doe');
    expect(mappedCustomer.email).to.equal('automated-tests@ns8.com');
    expect(mappedCustomer.phone).to.equal('+15555555555');
    expect(mappedCustomer.totalSpent).to.equal(1.0);
    expect(mappedCustomer.platformCreatedAt).to.be.instanceOf(Date);
  });

  it('should fallback to the default_address first & last names top level are empty strings', () => {
    const customer: IOrderCustomer = orderCustomerFromPartial({
      first_name: '',
      last_name: '',
      default_address: defaultAddress,
    });

    const mappedCustomer = mapCustomer(customer, billingAddress);

    expect(mappedCustomer).to.be.an.instanceOf(Customer);
    expect(mappedCustomer.firstName).to.equal('default first name');
    expect(mappedCustomer.lastName).to.equal('default last name');
  });

  it('should fallback to the default_address first & last names top level are null', () => {
    const customer: IOrderCustomer = orderCustomerFromPartial({
      first_name: null,
      last_name: null,
      default_address: defaultAddress,
    });

    const mappedCustomer = mapCustomer(customer, billingAddress);

    expect(mappedCustomer).to.be.an.instanceOf(Customer);
    expect(mappedCustomer.firstName).to.equal('default first name');
    expect(mappedCustomer.lastName).to.equal('default last name');
  });

  describe('phone number precedence', () => {
    it('should use customer.phone first, if it exists', () => {
      const customer: IOrderCustomer = orderCustomerFromPartial({
        phone: '+12223334444',
        default_address: defaultAddress,
      });

      const result = mapCustomer(customer, billingAddress);

      expect(result.phone).to.equal(customer.phone);
    });

    it('should use customer.default_address.phone second, if customer.phone doesn\'t exist', () => {
      const customer: IOrderCustomer = orderCustomerFromPartial({
        default_address: defaultAddress,
      });
      delete customer.phone;

      const result = mapCustomer(customer, billingAddress);

      expect(result.phone).to.equal('+13334445555');
    });

    it('should use billing_address.phone third, if customer.phone and default_address.phone don\'t exist', () => {
      const customer: IOrderCustomer = orderCustomerFromPartial({
        default_address: defaultAddress,
      });
      delete customer.phone;
      delete customer.default_address.phone;

      const result = mapCustomer(customer, billingAddress);

      expect(result.phone).to.equal('+14445556666');
    });

    it('should return undefined if no phone numbers exist', () => {
      const customer: IOrderCustomer = orderCustomerFromPartial({
        default_address: defaultAddress,
      });
      delete customer.phone;
      delete customer.default_address.phone;
      delete billingAddress.phone;

      const result = mapCustomer(customer, billingAddress);

      expect(result.phone).to.be.undefined;
    });
  });
});
