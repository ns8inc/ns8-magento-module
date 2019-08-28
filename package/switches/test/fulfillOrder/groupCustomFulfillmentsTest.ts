import { expect } from 'chai';
import { FulfillmentGroup } from '../../src/types';
import {
  fulfillmentServiceFromPartial,
  newGiftCardLineItem,
  orderLineItemFromPartial,
} from '../objectGenerators/Shopify';
import { groupCustomFulfillments } from '../../src/fulfillOrder';
import { IFulfillmentService, IOrderLineItem } from 'shopify-api-node';

describe('groupCustomFulfillments', () => {
  const lineItems: IOrderLineItem[] = [];
  const fulfillmentGroups: FulfillmentGroup[] = [];
  const fulfillmentServices: IFulfillmentService[] = [];

  beforeEach(() => {
    fulfillmentServices.push(fulfillmentServiceFromPartial({
      location_id: Math.round(Math.random() * 1000000),
    }));
  });

  afterEach(() => {
    lineItems.length = 0;
    fulfillmentGroups.length = 0;
    fulfillmentServices.length = 0;
  });

  it('should group a line item with a custom fulfillment service', () => {
    lineItems.push(orderLineItemFromPartial({
      fulfillment_service: fulfillmentServices[0].handle,
    }));

    fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, lineItems));

    expect(fulfillmentGroups).to.not.be.empty;
    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].locationId).to.equal(fulfillmentServices[0].location_id);
  });

  it('should NOT group line items without custom fulfillment services', () => {
    lineItems.push(orderLineItemFromPartial({}));
    lineItems.push(newGiftCardLineItem());

    fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, lineItems));

    expect(fulfillmentGroups).to.be.empty;
  });

  it('should NOT group line items with any existing fulfillments', () => {
    lineItems.push(orderLineItemFromPartial({
      fulfillment_service: fulfillmentServices[0].handle,
      fulfillment_status: 'partial',
    }));
    lineItems.push(orderLineItemFromPartial({
      fulfillment_service: fulfillmentServices[0].handle,
      fulfillment_status: 'fulfilled',
    }));
    lineItems.push(orderLineItemFromPartial({
      fulfillment_service: fulfillmentServices[0].handle,
    }));

    fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, lineItems));

    expect(fulfillmentGroups).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].lineItems[0].fulfillment_service).to.equal(fulfillmentServices[0].handle);
  });

  it('should properly group multiple fulfillment services', () => {
    fulfillmentServices.push(fulfillmentServiceFromPartial({
      location_id: Math.round(Math.random() * 1000000),
      handle: 'second-fulfillment-service',
    }));
    lineItems.push(orderLineItemFromPartial({
      fulfillment_service: fulfillmentServices[0].handle,
    }));
    lineItems.push(orderLineItemFromPartial({
      fulfillment_service: fulfillmentServices[1].handle,
    }));

    fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, lineItems));

    expect(fulfillmentGroups).to.have.lengthOf(2);
    expect(fulfillmentGroups[0].lineItems[0].fulfillment_service).to.equal(fulfillmentServices[0].handle);
    expect(fulfillmentGroups[1].lineItems[0].fulfillment_service).to.equal(fulfillmentServices[1].handle);
  });

  it('should group an item with a positive fulfillable_quantity', () => {
    lineItems.push(orderLineItemFromPartial({
      fulfillable_quantity: 1,
      fulfillment_service: fulfillmentServices[0].handle,
    }));

    fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, lineItems));

    expect(fulfillmentGroups).to.not.be.empty;
    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].locationId).to.equal(fulfillmentServices[0].location_id);
  });

  it('should NOT group an item with a fulfillable_quantity of 0', () => {
    lineItems.push(orderLineItemFromPartial({
      fulfillable_quantity: 0,
      fulfillment_service: fulfillmentServices[0].handle,
    }));
    fulfillmentGroups.push(...groupCustomFulfillments(fulfillmentServices, lineItems));

    expect(fulfillmentGroups).to.be.empty;
  });
});
