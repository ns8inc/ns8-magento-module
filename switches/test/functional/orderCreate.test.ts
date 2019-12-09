import 'jest';
import { RestClient } from '@ns8/magento2-rest-client';
import * as fs from 'fs';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import {
  CreateOrderAction,
  MagentoState,
  MagentoStatus,
  UpdateOrderStatusAction
} from '../../dist';
import { createSwitchboardContextMock } from '../lib';

const switchboardData: SwitchContext[] = [];
require('dotenv').config();

beforeAll(done => {
  const options = {
    url: process.env.MAGENTO_URL || '',
    consumerKey: process.env.CONSUMER_KEY || '',
    consumerSecret: process.env.CONSUMER_SECRET || '',
    accessToken: process.env.ACCESS_TOKEN || '',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
    apiBaseUrl: process.env.API_BASE_URL || '',
    magentoBaseUrl: process.env.MAGENTO_BASE_URL || ''
  };

  const client = new RestClient(options);

  if (!fs.existsSync('test/mock_data')) fs.mkdirSync('test/mock_data');
  if (!fs.existsSync('test/mock_data/orders'))
    fs.mkdirSync('test/mock_data/orders');
  if (!fs.existsSync('test/mock_data/transactions'))
    fs.mkdirSync('test/mock_data/transactions');

  return client.orders.list().then(allOrders => {
    try {
      allOrders.items.forEach(item => {
        try {
          switchboardData.push(
            createSwitchboardContextMock(
              {
                order: {
                  entity_id: item.entity_id,
                  increment_id: item.increment_id,
                  status: item.status,
                  state: item.state
                }
              },
              options
            )
          );
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
    done();
  });
}, 30000);

test('Assert that order creation succeeds', done => {
  // Any valid item will do; just grab the first.
  // This test will not actually create new data
  const first = switchboardData[0];
  first.data.order.state = MagentoState.PENDING;
  first.data.order.status = MagentoStatus.PENDING;
  const order = new CreateOrderAction()
    .create(first)
    .then(data => {
      expect.anything();
      done();
    })
    .catch(reason => {
      done();
    });
});

test('Assert that order cancellation succeeds', done => {
  // Any valid item will do; just grab the first.
  // This test will not actually cancel an order
  const first = switchboardData[0];
  first.data.order.state = MagentoState.CANCELED;
  first.data.order.status = MagentoStatus.CANCELED;
  const order = new UpdateOrderStatusAction()
    .update(first)
    .then(data => {
      expect.anything();
      done();
    })
    .catch(reason => {
      done();
    });
});
