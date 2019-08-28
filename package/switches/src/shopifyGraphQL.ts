import * as fetch from 'isomorphic-fetch';
import { OutgoingHttpHeaders } from 'http';
import { URL } from 'url';

const shopifyGraphQL = {
  getUrl(domain: string): URL {
    return new URL('/admin/api/2019-04/graphql.json', `https://${domain}`);
  },
  getHeaders(accessToken: string): OutgoingHttpHeaders {
    return {
      'Content-Type': 'application/graphql',
      'X-Shopify-Access-Token': accessToken,
    };
  },
  async post(url: URL, headers: OutgoingHttpHeaders, query: string): Promise<any> {
    const options = {
      headers,
      method: 'POST',
      body: query,
    };

    return await fetch(url.toString(), options);
  },
};

export default shopifyGraphQL;
