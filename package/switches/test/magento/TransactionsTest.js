const Magento2Client = require('@ns8/magento2-rest-client').Magento2Client;

const result = require('dotenv').config();

const MagentoClient = Magento2Client({
  url: process.env.URL,
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET
});

MagentoClient.transactions.list().then(function(transactions) {
  console.log(transactions);
});
