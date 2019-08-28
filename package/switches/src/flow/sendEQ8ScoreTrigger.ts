import shopifyGraphQL from '../shopifyGraphQL';
import { SwitchContext } from 'ns8-switchboard-interfaces';

const sendEQ8ScoreTrigger = async (switchContext: SwitchContext, score: number) => {
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
    \\"trigger_id\\": \\"6c68b669-bf29-49c6-895a-2faf76377956\\",
    \\"properties\\": {
      \\"Score\\": ${score},
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

export default sendEQ8ScoreTrigger;
