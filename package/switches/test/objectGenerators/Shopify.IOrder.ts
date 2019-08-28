import {
  ICustomerAddress,
  IOrder,
  IOrderAdjustmentAmountSet,
  IOrderClientDetails,
  IOrderTaxLine,
  IPaymentDetails,
} from 'shopify-api-node';

const customerAddress: ICustomerAddress = {
  id: 1,
  customer_id: 1,
  first_name: 'John',
  address1: '241 W Charleston Blvd',
  phone: null,
  city: 'Las Vegas',
  zip: '89102',
  province: 'Nevada',
  country: 'United States',
  last_name: 'Doe',
  address2: '#111',
  company: null,
  latitude: '36.158321',
  longitude: '-115.158120',
  name: 'John Doe',
  country_code: 'US',
  province_code: 'NV',
  country_name: 'United States',
  default: true,
};

const clientDetails: IOrderClientDetails = {
  accept_language: 'en-US,en;q=0.9',
  browser_height: null,
  browser_ip: '0.0.0.0',
  browser_width: null,
  session_hash: null,
  user_agent: 'Mozilla\\/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit\\/537.36 ' +
    '(KHTML, like Gecko) Chrome\\/74.0.3729.131 Safari\\/537.36',
};

const paymentDetails: IPaymentDetails = {
  credit_card_bin: '1',
  avs_result_code: null,
  cvv_result_code: null,
  credit_card_number: '•••• •••• •••• 1',
  credit_card_company: 'Bogus',
};

const tenDollarSet: IOrderAdjustmentAmountSet = {
  shop_money: {
    amount: 10.00,
    currency_code: 'USD',
  },
  presentment_money: {
    amount: 10.00,
    currency_code: 'USD',
  },
};

const zeroDollarSet: IOrderAdjustmentAmountSet = {
  shop_money: {
    amount: 0.00,
    currency_code: 'USD',
  },
  presentment_money: {
    amount: 0.00,
    currency_code: 'USD',
  },
};

const taxLines: IOrderTaxLine[] = [
  {
    price: '0.00',
    price_set: {
      shop_money: {
        amount: '1.00',
        currency_code: 'USD',
      },
      presentment_money: {
        amount: '1.00',
        currency_code: 'USD',
      },
    },
    rate: 0.0,
    title: 'NV State Tax',
  },
  {
    price: '0.00',
    price_set: {
      shop_money: {
        amount: '1.00',
        currency_code: 'USD',
      },
      presentment_money: {
        amount: '1.00',
        currency_code: 'USD',
      },
    },
    rate: 0.0,
    title: 'Clark County Tax',
  },
];

const orderObject: IOrder = {
  app_id: 1,
  billing_address: customerAddress,
  browser_ip: '0.0.0.0',
  buyer_accepts_marketing: false,
  cancel_reason: null,
  cancelled_at: null,
  cart_token: '11223344556677889900',
  client_details: clientDetails,
  closed_at: null,
  confirmed: true,
  created_at: '2019-05-09T19:29:03-04:00',
  currency: 'USD',
  // customer ? : IOrderCustomer,
  customer_locale: null,
  discount_applications: [],
  discount_codes: [],
  email: 'apps@ns8.com',
  financial_status: 'authorized',
  fulfillments: [],
  fulfillment_status: null,
  gateway: 'bogus',
  id: 1,
  landing_site: null,
  line_items: [],
  location_id: null,
  name: '#1001',
  note: null,
  note_attributes: [],
  number: 1,
  order_number: 1,
  order_status_url: '',
  payment_details: paymentDetails,
  payment_gateway_names: ['bogus'],
  phone: '702-555-5555',
  presentment_currency: 'USD',
  processed_at: '2019-05-09T19:29:03-04:00',
  processing_method: 'direct',
  referring_site: null,
  refunds: [],
  shipping_address: customerAddress,
  shipping_lines: [],
  source_identifier: null,
  source_name: 'web',
  subtotal_price: '10.00',
  subtotal_price_set: tenDollarSet,
  tags: '',
  tax_lines: taxLines,
  taxes_included: false,
  test: true,
  token: '11223344556677889900',
  total_discounts: '0.00',
  total_discounts_set: zeroDollarSet,
  total_line_items_price: '10.00',
  total_line_items_price_set: tenDollarSet,
  total_price: '10.00',
  total_price_set: tenDollarSet,
  total_shipping_price_set: zeroDollarSet,
  total_tax: '0.00',
  total_tax_set: zeroDollarSet,
  total_tip_received: '0.0',
  total_weight: 0,
  updated_at: '2019-05-09T19:29:03-04:00',
  user_id: 1,
};

const orderFromPartial = (orderPartial: Partial<IOrder>): IOrder => (
  { ...orderObject, ...orderPartial }
);

const newDefaultOrder = () => orderObject;

export {
  newDefaultOrder,
  orderFromPartial,
};
