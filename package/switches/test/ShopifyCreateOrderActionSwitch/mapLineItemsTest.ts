import { expect } from 'chai';
import { IOrderLineItem } from 'shopify-api-node';
import { LineItem } from 'ns8-protect-models';
import { mapLineItems } from '../../src';
import { orderLineItemFromPartial } from '../objectGenerators/Shopify';

describe('mapLineItems', () => {
  const lineItemKeys = [
    'title',
    'name',
    'quantity',
    'sku',
    'vendor',
    'price',
    'variantId',
    'variantTitle',
    'platformProductId',
    'isGiftCard',
    'totalDiscount',
  ];

  it('should create a Protect LineItem', () => {
    const orderLineItems: IOrderLineItem[] = [orderLineItemFromPartial({
      title: 'test title',
      name: 'test name',
      quantity: 99,
      price: '9.99',
      sku: '123456',
      variant_id: 1,
      variant_title: 'test variant title',
      vendor: 'test vendor',
      product_id: 1,
      gift_card: false,
      total_discount: '0.00',
    })];

    const results: LineItem[] = mapLineItems(orderLineItems);

    expect(results).to.be.an('array');
    expect(results.length).to.equal(1);
    expect(results[0]).to.have.all.keys(lineItemKeys);
    expect(results[0].title).to.equal('test title');
    expect(results[0].name).to.equal('test name');
    expect(results[0].quantity).to.equal(99);
    expect(results[0].sku).to.equal('123456');
    expect(results[0].vendor).to.equal('test vendor');
    expect(results[0].price).to.equal(9.99);
    expect(results[0].variantId).to.equal('1');
    expect(results[0].variantTitle).to.equal('test variant title');
    expect(results[0].isGiftCard).to.be.false;
    expect(results[0].totalDiscount).to.equal(0);
  });

  it('should not fail if values are null', () => {
    const orderLineItems: IOrderLineItem[] = [orderLineItemFromPartial({
      title: null,
      name: null,
      quantity: null,
      price: null,
      sku: null,
      variant_id: null,
      variant_title: null,
      vendor: null,
      product_id: null,
      gift_card: null,
      total_discount: null,
    })];

    const results: LineItem[] = mapLineItems(orderLineItems);

    expect(results).to.be.an('array');
    expect(results.length).to.equal(1);
    expect(results[0]).to.have.all.keys(lineItemKeys);
  });

  it('should not fail if values are undefined', () => {
    const orderLineItems: IOrderLineItem[] = [orderLineItemFromPartial({
      title: undefined,
      name: undefined,
      quantity: undefined,
      price: undefined,
      sku: undefined,
      variant_id: undefined,
      variant_title: undefined,
      vendor: undefined,
      product_id: undefined,
      gift_card: undefined,
      total_discount: undefined,
    })];

    const results: LineItem[] = mapLineItems(orderLineItems);

    expect(results).to.be.an('array');
    expect(results.length).to.equal(1);
    expect(results[0]).to.have.all.keys(lineItemKeys);
  });
});
