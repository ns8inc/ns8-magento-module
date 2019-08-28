import { IFulfillmentService } from 'shopify-api-node';

const fulfillmentServiceObject: IFulfillmentService = {
  callback_url: null,
  email: 'apps@ns8.com',
  format: 'json',
  handle: 'test-custom-fulfillment-service',
  id: 1,
  include_pending_stock: false,
  inventory_management: false,
  location_id: 1,
  name: 'Test Custom Fulfillment Service',
  provider_id: null,
  requires_shipping_method: false,
  service_name: 'Test Custom Fulfillment Service',
  tracking_support: true,
};

const fulfillmentServiceFromPartial =
  (fulfillmentServicePartial: Partial<IFulfillmentService>): IFulfillmentService => (
    { ...fulfillmentServiceObject, ...fulfillmentServicePartial }
  );

export { fulfillmentServiceFromPartial };
