import { IOrder, OrderFinancialStatus } from 'shopify-api-node';
import { expect } from 'chai';
import { paymentCanBeCaptured } from '../../src/capturePayment';
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

const shopifyOrders: IOrder[] = [];

for (const financialStatus of orderFinancialStatuses) {
  shopifyOrders.push(orderFromPartial({ financial_status: financialStatus }));
}

describe('paymentCanBeCaptured', () => {
  let totalOrdersTested = 0;

  const captureTest = (orderList: IOrder[], shouldCancel: boolean): void => {
    totalOrdersTested += orderList.length;

    for (const order of orderList) {
      shouldCancel ?
        expect(paymentCanBeCaptured(order)).to.be.true :
        expect(paymentCanBeCaptured(order)).to.be.false;
    }
  };

  after(() => {
    describe(`Payment Capture Tests: ${shopifyOrders.length} generated order objects`, () => {
      it('have all been tested', () => {
        expect(totalOrdersTested).to.be.at.least(shopifyOrders.length);
      });
    });
  });

  it('should be a function', () => {
    expect(paymentCanBeCaptured).to.be.a('function');
  });

  it('should capture authorized orders', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => order.financial_status === 'authorized');

    captureTest(orderList, true);
  });

  it('should not capture orders with any status other than authorized', () => {
    const orderList: IOrder[] = shopifyOrders.filter((order) => order.financial_status !== 'authorized');

    captureTest(orderList, false);
  });
});
