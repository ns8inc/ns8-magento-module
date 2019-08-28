import shopifyGraphQL from '../shopifyGraphQL';
import { SwitchContext } from 'ns8-switchboard-interfaces';

const sendOrderRiskTrigger = async (switchContext: SwitchContext, risk: string) => {
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
    \\"trigger_id\\": \\"589f8f9c-a07e-4088-9c86-bda43d2193fa\\",
    \\"properties\\": {
      \\"Risk\\": \\"${risk}\\",
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

export default sendOrderRiskTrigger;
