/* eslint-disable
  @typescript-eslint/no-unused-vars,
  @typescript-eslint/no-var-requires,
  import/order,
  no-console,
*/
import * as client from 'scp2';
import { env } from './loadEnv';

const SSHClient = require('node-ssh');

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

  const ssh = new SSHClient();
  ssh
    .connect({
      host: connection.host,
      username: connection.username,
      port: 22,
      password: connection.password,
      tryKeyboard: true,
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
          finish([connection.password]);
        }
      },
    })
    .then(() => {
      const clientUrl = process.env.NS8_CLIENT_URL || env.NS8_CLIENT_URL;
      const protectUrl = process.env.NS8_PROTECT_URL || env.NS8_PROTECT_URL;
      const commands = [
        `sed -i 's/"default_environment": "production"/"default_environment": "development"/' /var/www/html/vendor/ns8/protect-sdk/assets/configuration/core_configuration.json`,
        `sed -i 's^"api_url": "https://test-protect.ns8.com"^"api_url": "${protectUrl}"^' /var/www/html/vendor/ns8/protect-sdk/assets/configuration/core_configuration.json`,
        `sed -i 's^"client_url": "https://test-protect-client.ns8.com"^"client_url": "${clientUrl}"^' /var/www/html/vendor/ns8/protect-sdk/assets/configuration/core_configuration.json`,
      ];
      commands.forEach((cmd) => {
        ssh.execCommand(cmd).then((result) => {
          console.info(`Completed Configuration Command On Server: ${cmd}`);
          ssh.dispose();
        });
      });
    });

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
