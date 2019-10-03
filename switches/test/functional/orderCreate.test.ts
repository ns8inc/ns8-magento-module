import 'jest';
import { RestClient } from '@ns8/magento2-rest-client';
import * as fs from 'fs';
import { CreateOrder } from '../../dist/steps/CreateOrder';
import expectExport = require('expect');
const switchboardData = require('../mock_data/switchcontext.json');

beforeAll(() => {
  require('dotenv').config();

  const options = {
    url: process.env.MAGENTO_URL || '',
    consumerKey: process.env.CONSUMER_KEY || '',
    consumerSecret: process.env.CONSUMER_SECRET || '',
    accessToken: process.env.ACCESS_TOKEN || '',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
  };

  const client = new RestClient(options);

  if (!fs.existsSync('test/mock_data')) fs.mkdirSync('test/mock_data');
  if (!fs.existsSync('test/mock_data/orders')) fs.mkdirSync('test/mock_data/orders');
  if (!fs.existsSync('test/mock_data/transactions')) fs.mkdirSync('test/mock_data/transactions');

  return client.orders.list()
    .then( (data) => {
      try {
        fs.writeFileSync('test/mock_data/orders/orders.json', JSON.stringify(data, null, 2))
        data.items.forEach((item) => {
          try {
            client.orders.get(item.entity_id)
              .then(function (data) {
                fs.writeFileSync(`test/mock_data/orders/order_${item.entity_id}.json`, JSON.stringify(data, null, 2))
              })
          } catch (e) {
            console.error(e);
          }
        })
      } catch (e) {
        console.error(e);
      }
    })
});

describe('::testExecutionOfCreateOrderStep', () => {
  it('does not throw when called with mock data', () => {

    new CreateOrder().create(switchboardData).then((data) => { expect.anything() });
  });
});
