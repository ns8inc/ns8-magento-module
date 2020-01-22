/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { URL } from 'url';
import { Merchant, IntegrationPlatformType, ServiceIntegrationType, ServiceIntegration } from 'ns8-protect-models';
import { env } from '../../../build/loadEnv';

export const restClientOptions = {
  url: env.MAGENTO_URL || 'http://dev.ns8demos.com',
  consumerKey: env.CONSUMER_KEY || '1',
  consumerSecret: env.CONSUMER_SECRET || '2',
  accessToken: env.ACCESS_TOKEN || '3',
  accessTokenSecret: env.ACCESS_TOKEN_SECRET || '4',
  magentoBaseUrl: env.MAGENTO_BASE_URL || 'http://dev.ns8demos.com',
};

export const createSwitchboardContextMock = (): SwitchContext => {
  const ret: SwitchContext = new SwitchContext({
    apiBaseUrl: new URL(restClientOptions.magentoBaseUrl),
    data: {
      order: {
        entity_id: 1,
        increment_id: '000000001',
      },
    },
    merchant: new Merchant({
      integrationPlatformType: IntegrationPlatformType.MAGENTO,
      storefrontUrl: restClientOptions.magentoBaseUrl,
      serviceIntegrations: [
        new ServiceIntegration({
          identitySecret: restClientOptions.consumerSecret,
          identityToken: restClientOptions.consumerKey,
          secret: restClientOptions.accessTokenSecret,
          token: restClientOptions.accessToken,
          type: ServiceIntegrationType.MAGENTO,
        }),
      ],
    }),
  });

  return ret;
};
