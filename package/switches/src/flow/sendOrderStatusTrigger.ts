import shopifyGraphQL from '../shopifyGraphQL';
import { SwitchContext } from 'ns8-switchboard-interfaces';

const sendOrderStatusTrigger = async (switchContext: SwitchContext, status: string) => {
  const {
    data: {
      platformId: orderNumber,
    },
    merchant: {
      domain,
      serviceIntegrations,
    },
  } = switchContext;

  const { token: accessToken } = serviceIntegrations
    .find((item) => item.type === 'SHOPIFY');

  const query = `mutation {
    flowTriggerReceive(body: "{
    \\"trigger_id\\": \\"d56fe721-533e-494b-ade0-9ee09b18bbdf\\",
    \\"properties\\": {
      \\"Status\\": \\"${status}\\",
      \\"order_id\\": ${orderNumber}
    }
  }") {
      userErrors {
        field,
        message
      }
    }
  }`;

  return await shopifyGraphQL.post(shopifyGraphQL.getUrl(domain), shopifyGraphQL.getHeaders(accessToken), query);
};

export default sendOrderStatusTrigger;
