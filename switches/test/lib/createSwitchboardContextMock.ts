import { SwitchContext } from 'ns8-switchboard-interfaces';
import { URL } from 'url';
import {
  Merchant,
  IntegrationPlatformType,
  ServiceIntegrationType,
  ServiceIntegration
} from 'ns8-protect-models';

export const createSwitchboardContextMock = (
  data: any,
  options: any
): SwitchContext => {
  const ret: SwitchContext = new SwitchContext({
    apiBaseUrl: new URL(options.apiBaseUrl),
    data,
    merchant: new Merchant({
      integrationPlatformType: IntegrationPlatformType.MAGENTO,
      storefrontUrl: options.magentoBaseUrl,
      serviceIntegrations: [
        new ServiceIntegration({
          identitySecret: options.consumerSecret,
          identityToken: options.consumerKey,
          secret: options.accessTokenSecret,
          token: options.accessToken,
          type: ServiceIntegrationType.MAGENTO
        })
      ]
    })
  });

  return ret;
};
