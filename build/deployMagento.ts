import * as client from 'scp2';
require('dotenv').config();

export const deployToMagento = () => {
  client.scp('module/', {
    host: process.env.MAGENTO_IP_ADDRESS,
    username: process.env.MAGENTO_SSH_USERNAME,
    password: process.env.MAGENTO_SSH_PASSWORD,
    path: '/var/www/html/app/code/NS8/CSP2/'
  }, (err) => {
      if (err) {
        console.error(err);
        console.warn('scp copy failed');
      } else {
        console.info('SCP Deployment to Magento Succeeded');
      }
  });
}

deployToMagento();
