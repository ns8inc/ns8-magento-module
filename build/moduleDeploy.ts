/* eslint-disable import/order */
/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import * as client from 'scp2';
import { env } from './loadEnv';

/**
 * Uses SCP to copy the module folder to the dev location on the magento instance.
 *
 * This depends on these `.env` variables to be set:
 * `MAGENTO_IP_ADDRESS`: IP Address for SSH connection to Magento instance
 * `MAGENTO_SSH_USERNAME`: Username enabled for SSH
 * `MAGENTO_SSH_PASSWORD`: Password for SSH (either this or a private key is required)
 * `MAGENTO_SSH_PRIVATE_KEY`: Path to a private key to use instead of a password
 */
export const moduleDeploy = (): void => {
  if (!process.env.MAGENTO_IP_ADDRESS && !env.MAGENTO_IP_ADDRESS) {
    throw new Error('You must set the `.env` variable for the MAGENTO_IP_ADDRESS.');
  }
  if (!process.env.MAGENTO_SSH_USERNAME && !env.MAGENTO_SSH_USERNAME) {
    throw new Error('You must set the `.env` variable for the MAGENTO_SSH_USERNAME.');
  }
  if (
    !process.env.MAGENTO_SSH_PASSWORD &&
    !env.MAGENTO_SSH_PASSWORD &&
    !process.env.MAGENTO_SSH_PRIVATE_KEY &&
    !env.MAGENTO_SSH_PRIVATE_KEY
  ) {
    throw new Error(
      'You must set the `.env` variables for either the MAGENTO_SSH_PASSWORD or the MAGENTO_PRIVATE_KEY.',
    );
  }

  const connection: any = {
    host: process.env.MAGENTO_IP_ADDRESS,
    username: process.env.MAGENTO_SSH_USERNAME,
    path: '/var/www/html/app/code/NS8/Protect/',
  };
  if (process.env.MAGENTO_SSH_PASSWORD || env.MAGENTO_SSH_PASSWORD) {
    connection.password = process.env.MAGENTO_SSH_PASSWORD || env.MAGENTO_SSH_PASSWORD;
  } else {
    connection.privateKey = process.env.MAGENTO_SSH_PRIVATE_KEY || env.MAGENTO_SSH_PRIVATE_KEY;
  }

  client.scp('module/', connection, (err: any) => {
    if (err) {
      console.error(err);
      console.warn('scp copy failed');
    } else {
      console.info('SCP Deployment to Magento Succeeded');
    }
  });
};

try {
  moduleDeploy();
} catch (error) {
  console.error(error);
  console.info(env);
}
