import shopifyGraphQL from '../shopifyGraphQL';
import { SwitchContext } from 'ns8-switchboard-interfaces';

const sendCustomerVerificationTrigger = async (switchContext: SwitchContext, status: string) => {
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
    \\"trigger_id\\": \\"49ae8aac-31c4-4786-969d-c5e25cf1c59e\\",
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

export default sendCustomerVerificationTrigger;
