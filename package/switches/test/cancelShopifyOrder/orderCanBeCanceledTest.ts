import { IOrder, IOrderFulfillment, OrderFinancialStatus, OrderFulfillmentStatus } from 'shopify-api-node';
import { expect } from 'chai';
import { orderCanBeCanceled } from '../../src/cancelShopifyOrder';
import { orderFromPartial } from '../objectGenerators/Shopify';

const orderFinancialStatuses: OrderFinancialStatus[] = [
  'authorized',
  'paid',
  'partially_paid',
  'partially_refunded',
  'pending',
  'refunded',
  'voided',
];

const orderFulfillmentStatuses: OrderFulfillmentStatus[] = [
  'fulfilled',
  'partial',
  'restocked',
  null,
];

const orderFulfillments = [
  {} as IOrderFulfillment,
];

const shopifyOrders: IOrder[] = [];

for (const financialStatus of orderFinancialStatuses) {
  for (const fulfillmentStatus of orderFulfillmentStatuses) {
    shopifyOrders.push(orderFromPartial({
      financial_status: financialStatus,
      fulfillment_status: fulfillmentStatus,
      fulfillments: fulfillmentStatus ? orderFulfillments : [],
    }));
  }
}

describe('orderCanBeCanceled', () => {
  let totalOrdersTested = 0;

  const cancellationTest = (orderList: IOrder[], shouldCancel: boolean): void => {
    totalOrdersTested += orderList.length;

    for (const order of orderList) {
      shouldCancel ?
        expect(orderCanBeCanceled(order)).to.be.true :
        expect(orderCanBeCanceled(order)).to.be.false;
    }
  };

  after(() => {
    describe(`Order Cancellation Tests: ${shopifyOrders.length} generated order objects`, () => {
      it('have all been tested', () => {
        expect(totalOrdersTested).to.be.at.least(shopifyOrders.length);
      });
    });
  });

  it('should be a function', () => {
    expect(orderCanBeCanceled).to.be.a('function');
  });

  it('should not cancel orders that have fulfillments', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => order.fulfillments.length > 0);

    cancellationTest(orderList, false);
  });

  it('should not cancel orders that have a fulfillment_status', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => order.fulfillment_status);

    cancellationTest(orderList, false);
  });

  it('should not cancel orders that are partially paid', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => order.financial_status === 'partially_paid');

    cancellationTest(orderList, false);
  });

  it('should not cancel orders that are partially refunded', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => order.financial_status === 'partially_refunded');

    cancellationTest(orderList, false);
  });

  it('should cancel orders that are authorized and have no fulfillments', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => (
      order.financial_status === 'authorized'
      && order.fulfillment_status === null
      && order.fulfillments.length === 0
    ));

    cancellationTest(orderList, true);
  });

  it('should cancel orders that are fully paid and have no fulfillments', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => (
      order.financial_status === 'paid'
      && order.fulfillment_status === null
      && order.fulfillments.length === 0
    ));

    cancellationTest(orderList, true);
  });

  it('should cancel orders that are fully refunded and have no fulfillments', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => (
      order.financial_status === 'refunded'
      && order.fulfillment_status === null
      && order.fulfillments.length === 0
    ));

    cancellationTest(orderList, true);
  });

  it('should cancel orders that have a voided authorization and have no fulfillments', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => (
      order.financial_status === 'voided'
      && order.fulfillment_status === null
      && order.fulfillments.length === 0
    ));

    cancellationTest(orderList, true);
  });
});
