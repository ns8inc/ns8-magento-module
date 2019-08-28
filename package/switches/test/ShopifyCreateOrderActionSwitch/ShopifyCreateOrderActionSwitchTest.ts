import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Shopify from 'shopify-api-node';
import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import { ShopifyCreateOrderActionSwitch } from '../../src';
import { switchContextFromPartial } from '../objectGenerators/Protect';
import {
  newCreditCardTransaction,
  newDefaultOrder,
  newNonCreditCardTransaction,
  transactionFromPartial,
} from '../objectGenerators/Shopify';
import * as client from '../../src/getShopifyClient';
import { Order } from 'ns8-protect-models';

describe('ShopifyCreateOrderActionSwitch', () => {
  const createOrderActionSwitch: CreateOrderActionSwitch = new ShopifyCreateOrderActionSwitch();
  const switchContext: SwitchContext = switchContextFromPartial({});
  const nonCreditCardGateways: string[] = [
    'Money Order',
    'Cash on Delivery (COD)',
    'Bank Deposit',
    'Custom Payment Type',
  ];

  let shopifyClientFakes;

  beforeEach(() => {
    shopifyClientFakes = {
      order: {
        get: sinon.fake.resolves(newDefaultOrder()),
      },
      transaction: {
        list: sinon.fake.resolves([]),
      },
    };

    sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));
  });

  afterEach(() => {
    sinon.restore();
  });

  for (const gateway of nonCreditCardGateways) {
    describe(`${gateway} Transactions`, () => {
      it('with a status of \"pending\" should be processed', async () => {
        switchContext.data = newNonCreditCardTransaction(gateway, 'pending');

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.an.instanceof(Order);
      });

      it('with a status of \"success\" should be processed', async () => {
        switchContext.data = newNonCreditCardTransaction(gateway, 'pending');

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.an.instanceof(Order);
      });

      it('with a status of \"failure\" should be skipped', async () => {
        switchContext.data = newNonCreditCardTransaction(gateway, 'failure');

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.undefined;
      });

      it('with a status of \"error\" should be skipped', async () => {
        switchContext.data = newNonCreditCardTransaction(gateway, 'error');

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.undefined;
      });
    });
  }

  describe('Point of Sale Transactions', () => {
    it('should be skipped', async () => {
      switchContext.data = transactionFromPartial({
        source_name: 'pos',
      });

      const createOrderResults = await createOrderActionSwitch.create(switchContext);

      expect(createOrderResults).to.be.undefined;
    });
  });

  describe('Credit Card Transactions', () => {
    it('should skip all authorization transactions if their status is not success', async () => {
      const statuses: Shopify.TransactionStatus[] = [
        'error',
        'failure',
        'pending',
      ];

      for (const status of statuses) {
        switchContext.data = newCreditCardTransaction(status, 'authorization');

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.undefined;
      }
    });

    it('should skip all successful transactions that are not of kind: authorization or sale', async () => {
      const kinds: Shopify.TransactionKind[] = [
        'capture',
        'refund',
        'void',
      ];

      for (const kind of kinds) {
        switchContext.data = newCreditCardTransaction('success', kind);

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.undefined;
      }
    });

    it('should process an order with an authorized transaction', async () => {
      switchContext.data = newCreditCardTransaction('success', 'authorization');

      const createOrderResults = await createOrderActionSwitch.create(switchContext);

      expect(createOrderResults).to.be.an.instanceof(Order);
    });

    it('should process an order with auto payment capture', async () => {
      switchContext.data = newCreditCardTransaction('success', 'sale');

      const createOrderResults = await createOrderActionSwitch.create(switchContext);

      expect(createOrderResults).to.be.an.instanceof(Order);
    });
  });

  describe('Missing client_details', () => {
    describe('test order', () => {
      afterEach(() => {
        sinon.restore();
      });

      it('without client details should create an order', async () => {
        const order = newDefaultOrder();
        delete order.client_details;

        shopifyClientFakes.order.get = sinon.fake.resolves(order);

        switchContext.data = newCreditCardTransaction();

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.an.instanceof(Order);
      });

      it('with client details should create an order', async () => {
        const order = newDefaultOrder();

        shopifyClientFakes.order.get = sinon.fake.resolves(order);

        switchContext.data = newCreditCardTransaction();

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.an.instanceof(Order);
      });

      it('with empty client details should create an order', async () => {
        const order = newDefaultOrder();

        order.client_details = {} as any;
        shopifyClientFakes.order.get = sinon.fake.resolves(order);

        switchContext.data = newCreditCardTransaction();

        const createOrderResults = await createOrderActionSwitch.create(switchContext);

        expect(createOrderResults).to.be.an.instanceof(Order);
      });
    });
  });

});
