import { env } from './loadEnv';
import { writeFileSync } from 'fs';

const destFolder = 'module/etc/integration/config.xml';
const productionClientUrl = 'https://magento-v2-api.ngrok.io';
const productionApiUrl = 'https://magento-v2-client.ngrok.io';
const productionEmail = 'apps@ns8.com';

const getConfigXml = (email: string, apiUrl: string, clientUrl: string): string => {
  return `<integrations>
  <integration name="NS8 Protect">
    <email>${email}</email>
    <endpoint_url>${apiUrl}/protect/magento/callback</endpoint_url>
    <identity_link_url>${clientUrl}/protect/magento/identity</identity_link_url>
  </integration>
</integrations>
`;
}

/**
 * Generates a `config.xml` file in the correct location for Magento.
 *
 * To generate a developer version of this file, you must set the following values in your `.env` file.
 * `DEV_EMAIL`: your email address
 * `CLIENT_BASE_URL`: your ngrok URL for the protect client
 * `API_BASE_URL`: your ngrok URL for the protect api
 */
export const moduleConfig = ():void => {
  let email = productionEmail,
    clientUrl = productionClientUrl,
    apiUrl = productionApiUrl;
  // If we are not in prod mode, use the .env variables
  if (process.env.NODE_ENV && process.env.NODE_ENV.trim().toLocaleLowerCase() !== 'prod') {
    if (process.env.DEV_EMAIL) {
      email = process.env.DEV_EMAIL;
    }
    if (process.env.CLIENT_BASE_URL) {
      clientUrl = process.env.CLIENT_BASE_URL;
    }
    if (process.env.API_BASE_URL) {
      apiUrl = process.env.API_BASE_URL;
    }
  }
  writeFileSync(destFolder, getConfigXml(email, apiUrl, clientUrl));
  console.info(`Set integration XML ${destFolder} with email='${email}'; apiUrl='${apiUrl}'; clientUrl='${clientUrl}'.`);
};

try {
  moduleConfig();
} catch (error) {
  console.error(error);
  console.info(env);
}
