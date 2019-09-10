let Magento2Client = require('@ns8/magento2-rest-client').Magento2Client;

let options = {
  url: 'http://dev-cfroehlich.ns8demos.com/rest',
  consumerKey: 'dhf4sbeb19ggwc2swk3898vt8s5sdmtj',
  consumerSecret: 'gyk1fbd1637zxq14dy3vs9x3jajq6km1',
  accessToken: 'ahwt6gymgl68cy1ol9av7i9ht4rb04wc',
  accessTokenSecret: '5rbez5wpc52utcxvun5ps4u2zcnhzcga'
};
let client = Magento2Client(options);

client.orders.list()
  .then(function (categories) {
    console.log(categories)
  })