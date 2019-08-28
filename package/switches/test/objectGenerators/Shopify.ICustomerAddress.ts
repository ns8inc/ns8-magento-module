import { ICustomerAddress } from 'shopify-api-node';

const customerAddressObject: ICustomerAddress = {
  id: 1,
  customer_id: 1,
  first_name: null,
  address1: null,
  phone: null,
  city: null,
  zip: null,
  province: null,
  country: null,
  last_name: null,
  address2: null,
  company: null,
  latitude: null,
  longitude: null,
  name: null,
  country_code: null,
  province_code: null,
  country_name: null,
  default: true,
};

const customerAddressFromPartial = (customerAddressPartial: Partial<ICustomerAddress>): ICustomerAddress => (
  { ...customerAddressObject, ...customerAddressPartial }
);

export { customerAddressFromPartial };
