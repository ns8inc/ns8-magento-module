import { SwitchContext } from 'ns8-switchboard-interfaces';
import { URL } from 'url';
import { Merchant, Profile, ServiceIntegrationType, ServiceIntegration } from 'ns8-protect-models';

const switchContext: SwitchContext = new SwitchContext({
  apiBaseUrl: new URL('https://ns8.com'),
  merchant: new Merchant({
    domain: 'mocha-test-store.myshopify.com',
    profile: new Profile({}),
    serviceIntegrations: [
      new ServiceIntegration({
        type: ServiceIntegrationType.SHOPIFY,
        token: '112233445566',
      }),
    ],
  }),
  data: {},
});

const switchContextFromPartial = (switchContextPartial: Partial<SwitchContext>): SwitchContext => (
  new SwitchContext({ ...switchContext, ...switchContextPartial })
);

export { switchContextFromPartial };
