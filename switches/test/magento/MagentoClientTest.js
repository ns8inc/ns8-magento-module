var rc = require('@ns8/magento2-rest-client');

let options = {
  url: 'http://dev-cfroehlich.ns8demos.com/rest',
  consumerKey: 'm9aj4z9q6b6z0ss708pvoxch22wkbqse',
  consumerSecret: 'c1k1l4ayzum511141ylk6w9qfkhtka7h',
  accessToken: '1bsygxga757vgd7id9i2w89zzvku28yo',
  accessTokenSecret: '89qym586bpshw5pqlqb50af5gmimx5h6'
};
let client = new rc.RestClient(options);

client.orders.list()
  .then(function (categories) {
    console.log(categories)
  })
