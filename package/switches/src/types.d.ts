import * as Shopify from 'shopify-api-node';

export interface FulfillmentGroup {
  locationId: number;
  lineItems: Shopify.IOrderLineItem[];
}

export interface PlatformOrderDetails {
  note_attributes: {
    'NS8 Status': string;
    'NS8 Order Risk': string;
    'NS8 EQ8 Score': string;
    'NS8 Customer Verification': string;
  };
}
