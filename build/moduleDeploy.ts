/* eslint-disable no-console */
import * as client from 'scp2';
import { env } from './loadEnv';

/**
 * Uses SCP to copy the module folder to the dev location on the magento instance.
 *
 * This depends on these `.env` variables to be set:
 * `MAGENTO_IP_ADDRESS`: IP Address for SSH connection to Magento instance
 * `MAGENTO_SSH_USERNAME`: Username enabled for SSH
 * `MAGENTO_SSH_PASSWORD`: Password for SSH
 */
export const moduleDeploy = (): void => {
  if (
    !process.env.MAGENTO_IP_ADDRESS ||
    !process.env.MAGENTO_SSH_USERNAME ||
    !process.env.MAGENTO_SSH_PASSWORD
  ) {
    throw new Error(
      'You must set the `.env` variables for the SSH connection.'
    );
  }

  client.scp(
    'module/',
    {
      host: process.env.MAGENTO_IP_ADDRESS,
      username: process.env.MAGENTO_SSH_USERNAME,
      password: process.env.MAGENTO_SSH_PASSWORD,
      path: '/var/www/html/app/code/NS8/Protect/'
    },
    err => {
      if (err) {
        console.error(err);
        console.warn('scp copy failed');
      } else {
        console.info('SCP Deployment to Magento Succeeded');
      }
    }
  );
};

try {
  moduleDeploy();
} catch (error) {
  console.error(error);
  console.info(env);
}
