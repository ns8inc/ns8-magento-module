import { SwitchContext } from 'ns8-switchboard-interfaces';
import * as Shopify from 'shopify-api-node';

const getShopifyClient = (switchContext: SwitchContext): Shopify => {
  const { domain: shopName } = switchContext.merchant;
  const accessToken: string = switchContext.getIntegrationAccessToken('SHOPIFY');

  return new Shopify({ shopName, accessToken });
};

export default getShopifyClient;
