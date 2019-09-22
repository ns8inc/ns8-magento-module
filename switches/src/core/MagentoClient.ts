import { RestClient } from '@ns8/magento2-rest-client';

import { config } from 'dotenv';
config();

export const MagentoClient: RestClient = new RestClient({
  url: process.env.URL,
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET
});
