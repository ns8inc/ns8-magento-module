import { IOrderCustomer, IOrderLineItem } from 'shopify-api-node';

const orderCustomerObject: IOrderCustomer = {
  accepts_marketing: false,
  created_at: null,
  default_address: null,
  email: null,
  first_name: null,
  id: 1,
  last_name: null,
  phone: null,
  multipass_identifier: null,
  last_order_id: null,
  last_order_name: null,
  note: null,
  orders_count: 1,
  state: 'enabled',
  tags: null,
  total_spent: null,
  updated_at: null,
};

const orderCustomerFromPartial = (orderCustomerPartial: Partial<IOrderCustomer>): IOrderCustomer => (
  { ...orderCustomerObject, ...orderCustomerPartial }
);

export { orderCustomerFromPartial };
