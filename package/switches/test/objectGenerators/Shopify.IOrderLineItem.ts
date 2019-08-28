import { IOrderLineItem } from 'shopify-api-node';

const orderLineItemObject: IOrderLineItem = {
  fulfillable_quantity: 1,
  fulfillment_service: 'manual',
  fulfillment_status: null,
  grams: 0,
  id: 1,
  price: '1.00',
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
  product_id: null,
  quantity: 1,
  requires_shipping: true,
  sku: '111111',
  title: 'Mocha test line item',
  variant_id: null,
  variant_title: '',
  vendor: 'Mocha Test Store',
  name: 'Mocha test line item',
  gift_card: false,
  properties: [],
  taxable: true,
  tax_lines: [],
  total_discount: '0.00',
  total_discount_set: {
    shop_money: {
      amount: '1.00',
      currency_code: 'USD',
    },
    presentment_money: {
      amount: '1.00',
      currency_code: 'USD',
    },
  },
};

const orderLineItemFromPartial = (orderLineItemPartial: Partial<IOrderLineItem> = {}): IOrderLineItem => (
  { ...orderLineItemObject, ...orderLineItemPartial }
);

const newGiftCardLineItem = (orderLineItemPartial: Partial<IOrderLineItem> = {}): IOrderLineItem => (
  orderLineItemFromPartial({...{
    id: Math.round(Math.random() * 1000000),
    gift_card: true,
  }, ...orderLineItemPartial})
);

export {
  orderLineItemFromPartial,
  newGiftCardLineItem,
};
