import * as Shopify from 'shopify-api-node';
import { FulfillmentGroup } from './types';

const getAllLocations = async (shopifyClient: Shopify): Promise<Shopify.ILocation[] | Error> => (
  await shopifyClient.location.list()
    .catch((error) => new Error(`Could not fetch locations. ${JSON.stringify(error)}`)));

const getPhysicalLocations = (locations: Shopify.ILocation[]): Shopify.ILocation[] => (
  locations.filter(
    (location: Shopify.ILocation): boolean => location.active && !location.legacy));

const getFulfillmentServices = async (shopifyClient: Shopify): Promise<Shopify.IFulfillmentService[] | Error> => (
  await shopifyClient.fulfillmentService.list({ scope: 'all' })
    .catch((error) => new Error(`Could not fetch fulfillment services. ${JSON.stringify(error)}`)));

const hasCustomFulfillmentService = (allLocations: Shopify.ILocation[]): boolean => (
  allLocations.some((location) => location.active && location.legacy)
);

const groupNativeFulfillments = (
  location: Shopify.ILocation,
  lineItems: Shopify.IOrderLineItem[],
): FulfillmentGroup[] => ([
  {
    locationId: location.id,
    lineItems: lineItems.filter((item) => (
      item.gift_card
      && item.fulfillment_status === null
      && item.fulfillable_quantity > 0)),
  },
  {
    locationId: location.id,
    lineItems: lineItems
      .filter((item) => (
        !item.gift_card
        && item.fulfillment_service === 'manual'
        && item.fulfillment_status === null
        && item.fulfillable_quantity > 0)),
  },
]);

const groupCustomFulfillments = (
  fulfillmentServices: Shopify.IFulfillmentService[],
  lineItems: Shopify.IOrderLineItem[],
): FulfillmentGroup[] => (
  fulfillmentServices.map((service) => ({
    lineItems: lineItems
      .filter((item) => (
        item.fulfillment_service === service.handle
        && item.fulfillment_status === null
        && item.fulfillable_quantity > 0)),
    locationId: service.location_id,
  })).filter((item) => item.lineItems.length > 0));

const fulfillOrder = async (shopifyClient: Shopify, orderId: number): Promise<string | Error> => {
  let returnMessage: string | Error;
  const { line_items } = await shopifyClient.order.get(orderId, { fields: 'line_items' });

  const allLocations: Shopify.ILocation[] | Error = await getAllLocations(shopifyClient);

  if (allLocations instanceof Error) {
    returnMessage = allLocations;
  } else {
    const physicalLocations: Shopify.ILocation[] = getPhysicalLocations(allLocations);

    // Currently we are only supporting shops with one active physical location.
    if (physicalLocations.length === 1) {
      const fulfillmentGroups: FulfillmentGroup[] = [...groupNativeFulfillments(physicalLocations[0], line_items)];

      if (hasCustomFulfillmentService(allLocations)) {
        const fulfillmentServices: Shopify.IFulfillmentService[] | Error = await getFulfillmentServices(shopifyClient);

        if (!(fulfillmentServices instanceof Error)) {
          fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, line_items));
        }
      }

      const fulfillmentResults: Shopify.IFulfillment[] = [];

      // Fulfill each fulfillmentGroup's line items
      for (const { locationId, lineItems } of fulfillmentGroups) {
        if (lineItems.length > 0) {
          const fulfillmentPayload = {
            location_id: locationId,
            tracking_number: null,
            line_items: lineItems,
          };

          fulfillmentResults.push(await shopifyClient.fulfillment.create(orderId, fulfillmentPayload));
        }
      }

      returnMessage = new Error('Not all order items were fulfilled.');

      if (fulfillmentResults.every((result) => result.status === 'success')) {
        returnMessage = 'All order items fulfilled successfully.';
      }
    } else {
      returnMessage = new Error(`Expected 1 active physical location, found ${physicalLocations.length}`);
    }
  }

  return returnMessage;
};

export { groupNativeFulfillments, groupCustomFulfillments };
export default fulfillOrder;
