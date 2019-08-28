import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Shopify from 'shopify-api-node';
import * as cancelOrder from '../../src/cancelShopifyOrder';
import * as client from '../../src/getShopifyClient';
import { orderFromPartial, newCreditCardTransaction } from '../objectGenerators/Shopify';

describe('cancelShopifyOrder', () => {
  let amount;
  let id;
  let shopifyClientFakes;
  let order: Shopify.IOrder;

  beforeEach(() => {
    id = Math.round(Math.random() * 1000000);
    amount = Math.round(Math.random() * 100);
    order = orderFromPartial({
      id,
      fulfillments: [],
      fulfillment_status: null,
      total_price_set: {
        presentment_money: {
          amount,
          currency_code: 'USD',
        },
        shop_money: {
          amount,
          currency_code: 'USD',
        },
      },
    });

    shopifyClientFakes = {
      order: {
        cancel: sinon.fake.resolves({}),
        get: sinon.fake.resolves({}),
      },
      transaction: {
        create: sinon.fake.resolves({}),
        list: sinon.fake.resolves([newCreditCardTransaction()]),
      },
    };

    sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should refund cancel a fully paid order', async () => {
    order.financial_status = 'paid';
    shopifyClientFakes.order.get = sinon.fake.resolves(order);
    shopifyClientFakes.order.cancel = sinon.fake.resolves(order);

    const cancelOrderResults = await cancelOrder.default(shopifyClientFakes, 1);

    expect(cancelOrderResults).to.equal('Paid order refunded and canceled.');
  });

  it('should cancel a fully refunded order', async () => {
    order.financial_status = 'refunded';
    shopifyClientFakes.order.get = sinon.fake.resolves(order);
    shopifyClientFakes.order.cancel = sinon.fake.resolves(order);

    const cancelOrderResults = await cancelOrder.default(shopifyClientFakes, 1);

    expect(cancelOrderResults).to.equal('Refunded order canceled.');
  });

  it('should void and cancel an authorized order', async () => {
    order.financial_status = 'authorized';
    shopifyClientFakes.order.get = sinon.fake.resolves(order);
    shopifyClientFakes.order.cancel = sinon.fake.resolves(order);

    const cancelOrderResults = await cancelOrder.default(shopifyClientFakes, 1);

    expect(cancelOrderResults).to.match(/Transaction voided successfully/);
    expect(cancelOrderResults).to.match(/Order canceled successfully/);
  });

  it('should still cancel an order even if void fails', async () => {
    order.financial_status = 'authorized';
    shopifyClientFakes.order.get = sinon.fake.resolves(order);
    shopifyClientFakes.order.cancel = sinon.fake.resolves(order);
    shopifyClientFakes.transaction.create = sinon.fake.resolves(new Error('Unable to void transaction'));

    const cancelOrderResults = await cancelOrder.default(shopifyClientFakes, 1);

    expect(cancelOrderResults).to.match(/Unable to void transaction/);
    expect(cancelOrderResults).to.match(/Order canceled successfully/);
  });
});
