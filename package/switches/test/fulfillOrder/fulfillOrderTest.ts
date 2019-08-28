import { IOrder, ILocation, IFulfillmentService } from 'shopify-api-node';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import fulfillOrder from '../../src/fulfillOrder';
import getShopifyClient from '../../src/getShopifyClient';
import { switchContextFromPartial } from '../objectGenerators/Protect';
import { newLegacyLocation, newPhysicalLocation, newDefaultOrder } from '../objectGenerators/Shopify';
import { fulfillmentServiceFromPartial } from '../objectGenerators/Shopify.IFulfillmentService';

describe('fulfillOrder', () => {
  const shopifyOrders: IOrder[] = [];
  const locations: ILocation[] = [];
  const fulfillmentServices: IFulfillmentService[] = [];
  const switchContext: SwitchContext = switchContextFromPartial({});

  let fulfillOrderSpy;
  let shopifyClient;
  let shopifyClientStubs;

  beforeEach(() => {
    shopifyOrders.push(newDefaultOrder());
    fulfillOrderSpy = sinon.spy(fulfillOrder);
    shopifyClient = getShopifyClient(switchContext);
    locations.length = 0;
    fulfillmentServices.length = 0;

    shopifyClientStubs = {
      location: {
        list: sinon.stub(shopifyClient.location, 'list'),
      },
      fulfillmentService: {
        list: sinon.stub(shopifyClient.fulfillmentService, 'list'),
      },
      order: {
        get: sinon.stub(shopifyClient.order, 'get'),
      },
      fulfillment: {
        create: sinon.stub(shopifyClient.fulfillment, 'create'),
      },
    };

    // default resolutions
    shopifyClientStubs.location.list.resolves([]);
    shopifyClientStubs.fulfillmentService.list.resolves([]);
    shopifyClientStubs.order.get.resolves({});
    shopifyClientStubs.fulfillment.create.resolves({});
  });

  afterEach(() => {
    shopifyClientStubs.location.list.restore();
    shopifyClientStubs.fulfillmentService.list.restore();
    shopifyClientStubs.order.get.restore();
    shopifyClientStubs.fulfillment.create.restore();
  });

  it('should fulfill with one active physical location only', async () => {
    locations.push(newPhysicalLocation(true));
    shopifyClientStubs.location.list.resolves(locations);
    shopifyClientStubs.fulfillmentService.list.resolves([]);
    shopifyClientStubs.order.get.resolves(shopifyOrders[0]);

    const fulfillResults = await fulfillOrderSpy(shopifyClient, 1)
      .catch((error) => error);

    expect(fulfillResults).to.not.be.an('Error');
  });

  it('should NOT fulfill with more than one active physical location', async () => {
    locations.push(newPhysicalLocation(true));
    locations.push(newPhysicalLocation(true));
    shopifyClientStubs.location.list.resolves(locations);
    shopifyClientStubs.fulfillmentService.list.resolves([]);
    shopifyClientStubs.order.get.resolves(shopifyOrders[0]);

    const fulfillResults = await fulfillOrderSpy(shopifyClient, 1)
      .catch((error) => error);

    expect(fulfillResults).to.be.an('Error');
  });

  it('should fulfill with one active physical and one inactive physical location', async () => {
    locations.push(newPhysicalLocation(true));
    locations.push(newPhysicalLocation(false));
    shopifyClientStubs.location.list.resolves(locations);
    shopifyClientStubs.fulfillmentService.list.resolves([]);
    shopifyClientStubs.order.get.resolves(shopifyOrders[0]);

    const fulfillResults = await fulfillOrderSpy(shopifyClient, 1)
      .catch((error) => error);

    expect(fulfillResults).to.not.be.an('Error');
  });

  it('should fulfill with one active physical and one legacy location', async () => {
    locations.push(newPhysicalLocation(true));
    locations.push(newLegacyLocation());
    fulfillmentServices.push(fulfillmentServiceFromPartial({
      location_id: locations[1].id,
    }));
    shopifyClientStubs.location.list.resolves(locations);
    shopifyClientStubs.fulfillmentService.list.resolves(fulfillmentServices);
    shopifyClientStubs.order.get.resolves(shopifyOrders[0]);

    const fulfillResults = await fulfillOrderSpy(shopifyClient, 1)
      .catch((error) => error);

    expect(fulfillResults).to.not.be.an('Error');
  });

  it('should fulfill with one active physical, one inactive physical, and one legacy location', async () => {
    locations.push(newPhysicalLocation(true));
    locations.push(newPhysicalLocation(false));
    locations.push(newLegacyLocation());
    fulfillmentServices.push(fulfillmentServiceFromPartial({
      location_id: locations[2].id,
    }));
    shopifyClientStubs.location.list.resolves(locations);
    shopifyClientStubs.fulfillmentService.list.resolves(fulfillmentServices);
    shopifyClientStubs.order.get.resolves(shopifyOrders[0]);

    const fulfillResults = await fulfillOrderSpy(shopifyClient, 1)
      .catch((error) => error);

    expect(fulfillResults).to.not.be.an('Error');
  });

  it('should fulfill with one active physical and two legacy locations', async () => {
    locations.push(newPhysicalLocation(true));
    locations.push(newLegacyLocation());
    locations.push(newLegacyLocation());
    fulfillmentServices.push(fulfillmentServiceFromPartial({
      location_id: locations[1].id,
    }));
    fulfillmentServices.push(fulfillmentServiceFromPartial({
      location_id: locations[2].id,
    }));
    shopifyClientStubs.location.list.resolves(locations);
    shopifyClientStubs.fulfillmentService.list.resolves(fulfillmentServices);
    shopifyClientStubs.order.get.resolves(shopifyOrders[0]);

    const fulfillResults = await fulfillOrderSpy(shopifyClient, 1)
      .catch((error) => error);

    expect(fulfillResults).to.not.be.an('Error');
  });
});
