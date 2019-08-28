import { expect } from 'chai';
import { FulfillmentGroup } from '../../src/types';
import { newPhysicalLocation, newGiftCardLineItem, orderLineItemFromPartial } from '../objectGenerators/Shopify';
import { groupNativeFulfillments } from '../../src/fulfillOrder';
import { ILocation, IOrderLineItem } from 'shopify-api-node';

describe('groupNativeFulfillments', () => {
  const lineItems: IOrderLineItem[] = [];
  const fulfillmentGroups: FulfillmentGroup[] = [];

  let physicalLocation: ILocation;

  beforeEach(() => {
    physicalLocation = newPhysicalLocation(true);
  });

  afterEach(() => {
    lineItems.length = 0;
    fulfillmentGroups.length = 0;
  });

  it('should put 1 gift card into group [0]', () => {
    lineItems.push(newGiftCardLineItem());
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[0].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[1].lineItems).to.be.empty;
  });

  it('should put 1 normal item into group [1]', () => {
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[1].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[0].lineItems).to.be.empty;
  });

  it('should put 1 gift card into group [0] and 1 normal item into group [1]', () => {
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    lineItems.push(newGiftCardLineItem());
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[1].id);
    expect(fulfillmentGroups[0].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[1].locationId).to.equal(physicalLocation.id);
  });

  it('should put 2 gift card into group [0] and 1 normal item into group [1]', () => {
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    lineItems.push(newGiftCardLineItem());
    lineItems.push(newGiftCardLineItem());
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(2);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[1].id);
    expect(fulfillmentGroups[0].lineItems[1].id).to.equal(lineItems[2].id);
    expect(fulfillmentGroups[0].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[1].locationId).to.equal(physicalLocation.id);
  });

  it('should put 1 gift card into group [0] and 2 normal item into group [1]', () => {
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    lineItems.push(newGiftCardLineItem());
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[1].id);
    expect(fulfillmentGroups[0].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(2);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[1].lineItems[1].id).to.equal(lineItems[2].id);
    expect(fulfillmentGroups[1].locationId).to.equal(physicalLocation.id);
  });

  it('should put 2 gift card into group [0] and 2 normal item into group [1]', () => {
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    lineItems.push(newGiftCardLineItem());
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    lineItems.push(newGiftCardLineItem());
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(2);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[1].id);
    expect(fulfillmentGroups[0].lineItems[1].id).to.equal(lineItems[3].id);
    expect(fulfillmentGroups[0].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(2);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[1].lineItems[1].id).to.equal(lineItems[2].id);
    expect(fulfillmentGroups[1].locationId).to.equal(physicalLocation.id);
  });

  it('should NOT put a custom fulfillment item into any groups', () => {
    lineItems.push(orderLineItemFromPartial({
      id: Math.round(Math.random() * 1000000),
      fulfillment_service: 'custom',
    }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.be.empty;
    expect(fulfillmentGroups[1].lineItems).to.be.empty;
  });

  it('should NOT group items that have any previous fulfillment', () => {
    lineItems.push(orderLineItemFromPartial({
      id: Math.round(Math.random() * 1000000),
      fulfillment_status: 'partial',
    }));
    lineItems.push(orderLineItemFromPartial({
      id: Math.round(Math.random() * 1000000),
      fulfillment_status: 'fulfilled',
    }));
    lineItems.push(orderLineItemFromPartial({
      ...newGiftCardLineItem(),
      fulfillment_status: 'partial',
    }));
    lineItems.push(orderLineItemFromPartial({
      ...newGiftCardLineItem(),
      fulfillment_status: 'fulfilled',
    }));
    lineItems.push(newGiftCardLineItem());
    lineItems.push(orderLineItemFromPartial({ id: Math.round(Math.random() * 1000000) }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[4].id);
    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[5].id);
  });

  it('should group a normal item with a positive fulfillable_quantity', () => {
    lineItems.push(orderLineItemFromPartial({
      id: Math.round(Math.random() * 1000000),
      fulfillable_quantity: 1,
    }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[1].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[1].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[1].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[0].lineItems).to.be.empty;
  });

  it('should NOT group a normal item with a fulfillable_quantity of 0', () => {
    lineItems.push(orderLineItemFromPartial({
      id: Math.round(Math.random() * 1000000),
      fulfillable_quantity: 0,
    }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.be.empty;
    expect(fulfillmentGroups[1].lineItems).to.be.empty;
  });

  it('should group a gift card item with a positive fulfillable_quantity', () => {
    lineItems.push(newGiftCardLineItem({ fulfillable_quantity: 1 }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.have.lengthOf(1);
    expect(fulfillmentGroups[0].lineItems[0].id).to.equal(lineItems[0].id);
    expect(fulfillmentGroups[0].locationId).to.equal(physicalLocation.id);
    expect(fulfillmentGroups[1].lineItems).to.be.empty;
  });

  it('should NOT group a gift card item with a fulfillable_quantity of 0', () => {
    lineItems.push(newGiftCardLineItem({ fulfillable_quantity: 0 }));
    fulfillmentGroups.push(...groupNativeFulfillments(physicalLocation, lineItems));

    expect(fulfillmentGroups[0].lineItems).to.be.empty;
    expect(fulfillmentGroups[1].lineItems).to.be.empty;
  });
});
