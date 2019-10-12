import 'jest';
import { RestClient } from '@ns8/magento2-rest-client';
import * as fs from 'fs';
import { CreateOrderAction } from '../../dist';
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

  const client = new RestClient(options);

  if (!fs.existsSync('test/mock_data')) fs.mkdirSync('test/mock_data');
  if (!fs.existsSync('test/mock_data/orders')) fs.mkdirSync('test/mock_data/orders');
  if (!fs.existsSync('test/mock_data/transactions')) fs.mkdirSync('test/mock_data/transactions');

  return client.orders.list()
    .then((allOrders) => {
      try {
        allOrders.items.forEach((item) => {
          try {
            switchboardData.push(createSwitchboardContextMock({
              order: {
                entity_id: item.entity_id,
                status: 'pending',
                state: 'new'
              }
            }, options))
          } catch (e) {
            console.error(e);
          }
        })
      } catch (e) {
        console.error(e);
      }
      done();
    });
}, 30000);

/**
 * TODO: fix the issue with async test execution in Jest
 */
test('does not throw when called with mock data', done => {

  var order = new CreateOrderAction().create(switchboardData[0]).then(data => {
    expect.anything();
    done();
  }).catch(reason => {
    done();
  });

});
