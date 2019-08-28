import { expect } from 'chai';
import * as sinon from 'sinon';
import { URL } from 'url';
import { ShopifyInstallEventSwitch } from '../../src';
import { SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';
import { switchContextFromPartial } from '../objectGenerators/Protect.SwitchContext';
import * as client from '../../src/getShopifyClient';

describe('ShopifyInstallEventSwitch', () => {
  const installEventSwitch: EventSwitch = new ShopifyInstallEventSwitch();
  const topicList = [
    'order_transactions/create',
    'shop/update',
    'orders/cancelled',
    'orders/paid',
    'orders/fulfilled',
    'app/uninstalled',
  ];
  const switchContext: SwitchContext = switchContextFromPartial({
    data: {
      actions: {
        CREATE_ORDER: 'CREATE_ORDER_ACTION',
        UNINSTALL: 'UNINSTALL_ACTION',
        UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS_ACTION',
        UPDATE_MERCHANT: 'UPDATE_MERCHANT_ACTION',
      },
      executorEndpoint: '/protect/executor',
      trackingEndpoint: '/protect/analytics/script',
    },
  });

  switchContext.createWebhookUrl = (): URL => new URL('/webhook', 'https://ns8.com');
  switchContext.createTrackingUrl = (): URL =>  new URL('/tracking', 'https://ns8.com');

  let shopifyClientFakes;

  beforeEach(() => {
    shopifyClientFakes = {
      scriptTag: {
        create: sinon.fake(),
        delete: sinon.fake(),
        list: sinon.fake.returns([1]),
      },
      webhook: {
        create: sinon.fake(),
        delete: sinon.fake(),
        list: sinon.fake.returns([1, 2, 3, 4, 5, 6]),
      },
    };

    sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create one script tag', async () => {
    const { scriptTag } = shopifyClientFakes;

    await installEventSwitch.handle(switchContext);

    expect(scriptTag.create.calledOnce).to.be.true;
    expect(scriptTag.create.calledWithExactly({
      src: switchContext.createTrackingUrl().toString(),
      event: 'onload',
      display_scope: 'all',
    })).to.be.true;
  });

  it('should create six webhooks in total', async () => {
    const { webhook } = shopifyClientFakes;

    await installEventSwitch.handle(switchContext);

    expect(webhook.create.callCount).to.equal(6);
  });

  for (const topic of topicList) {
    it(`should create a ${topic} webhook`, async() => {
      await installEventSwitch.handle(switchContext);

      const filterResults = shopifyClientFakes.webhook.create.args.filter((arg) => {
        return arg[0].topic === topic;
      });

      expect(filterResults).to.have.lengthOf(1);
    });
  }

  it('should delete any script tags that exist at time of installation', async () => {
    const { scriptTag } = shopifyClientFakes;

    await installEventSwitch.handle(switchContext);

    expect(scriptTag.delete.calledOnce).to.be.true;
  });

  it('should delete any webhooks that exist at time of installation', async () => {
    const { webhook } = shopifyClientFakes;

    await installEventSwitch.handle(switchContext);

    expect(webhook.delete.callCount).to.equal(6);
  });
});
