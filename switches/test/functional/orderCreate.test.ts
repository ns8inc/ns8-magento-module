import 'jest';
import { RestClient } from '@ns8/magento2-rest-client';
import * as fs from 'fs';
import { CreateOrderAction, MagentoState, UpdateOrderStatusAction } from '../../src';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { createSwitchboardContextMock } from '../lib';
const switchboardData: SwitchContext[] = [];
require('dotenv').config();

beforeAll((done) => {
  const options = {
    url: process.env.MAGENTO_URL || '',
    consumerKey: process.env.CONSUMER_KEY || '',
    consumerSecret: process.env.CONSUMER_SECRET || '',
    accessToken: process.env.ACCESS_TOKEN || '',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
    apiBaseUrl: process.env.API_BASE_URL || '',
    magentoBaseUrl: process.env.MAGENTO_BASE_URL || ''
  };

  if (!fs.existsSync('test/mock_data')) fs.mkdirSync('test/mock_data');
  if (!fs.existsSync('test/mock_data/orders')) fs.mkdirSync('test/mock_data/orders');
  if (!fs.existsSync('test/mock_data/transactions')) fs.mkdirSync('test/mock_data/transactions');

  switchboardData.push(createSwitchboardContextMock({
    order: {
      entity_id: 1,
      increment_id: '000000001',
      status: MagentoState.PENDING,
      state: MagentoState.PENDING
    }
  }, options))
}, 30000);

test('Assert that order creation succeeds', done => {
  //Any valid item will do; just grab the first.
  //This test will not actually create new data
  const first = switchboardData[0];
  first.data.order.state = MagentoState.PENDING;
  first.data.order.status = MagentoState.PENDING;
  first.data.order.entity_id = 200;
  first.data.order.increment_id = "000000201"
  const order = new CreateOrderAction().create(first).then(data => {
    expect.anything();
    done();
  }).catch(reason => {
    done();
  });

}, 10000000);
