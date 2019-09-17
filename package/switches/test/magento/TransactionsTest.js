const MagentoClient = require('../../dist/core/MagentoClient').MagentoClient;

MagentoClient.transactions.list({}).then(function(transactions) {
  console.log(transactions);
});
