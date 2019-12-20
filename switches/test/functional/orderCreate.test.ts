/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import 'jest';
import { OrderState } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { CreateOrderAction, UpdateOrderStatusAction } from '../../dist';
import { createSwitchboardContextMock } from '../lib';

const switchboardData: SwitchContext[] = [];
switchboardData.push(createSwitchboardContextMock());

// Placeholder for real tests
test('Stub', () => {
  expect.anything();
});

/*
These integration tests requires additional work before they can be used

test('Assert that order creation succeeds', done => {
  // Any valid item will do; just grab the first.
  // This test will not actually create new data
  const first = switchboardData[0];
  first.data.order.state = OrderState.PENDING;
  first.data.order.status = OrderState.PENDING;
  new CreateOrderAction()
    .create(first)
    .then(() => {
      expect.anything();
      done();
    })
    .catch(() => {
      done();
    });
});

test('Assert that order cancellation succeeds', done => {
  // Any valid item will do; just grab the first.
  // This test will not actually cancel an order
  const first = switchboardData[0];
  first.data.order.state = OrderState.CANCELED;
  first.data.order.status = OrderState.CANCELED;
  new UpdateOrderStatusAction()
    .update(first)
    .then(() => {
      expect.anything();
      done();
    })
    .catch(() => {
      done();
    });
});
*/
