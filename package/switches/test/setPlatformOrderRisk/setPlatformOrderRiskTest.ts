import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Shopify from 'shopify-api-node';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { FraudAssessment, Order, ProviderType, Risk, RiskFactor } from 'ns8-protect-models';
import setPlatformOrderRisk from '../../src/setPlatformOrderRisk';
import getShopifyClient from '../../src/getShopifyClient';
import { switchContextFromPartial } from '../objectGenerators/Protect';

describe('setPlatformOrderRisk', () => {
  const fraudAssessments: FraudAssessment[] = [];

  let switchContext: SwitchContext;
  let shopifyClient: Shopify;
  let shopifyClientStubs;

  beforeEach(() => {
    switchContext = switchContextFromPartial({});
    shopifyClient = getShopifyClient(switchContext);

    shopifyClientStubs = {
      orderRisk: {
        list: sinon.stub(shopifyClient.orderRisk, 'list'),
        delete: sinon.stub(shopifyClient.orderRisk, 'delete'),
        create: sinon.fake(),
      },
    };

    sinon.replace(shopifyClient.orderRisk, 'create', shopifyClientStubs.orderRisk.create);

    // default resolutions
    shopifyClientStubs.orderRisk.list.resolves([]);
    shopifyClientStubs.orderRisk.delete.resolves();
  });

  afterEach(() => {
    sinon.restore();
    fraudAssessments.length = 0;
    delete switchContext.data;
  });

  it('should send the platform order id as the first param when creating the primary OrderRisk', async () => {
    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.MEDIUM,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    expect(shopifyClientStubs.orderRisk.create.args[0][0].toString()).to.equal(switchContext.data.platformId);
  });

  it('should send a Shopify.IOrderRisk object as the second param when creating the primary OrderRisk', async () => {
    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.LOW,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    const {
      message,
      recommendation,
      score,
      source,
      cause_cancel,
      display,
    } = shopifyClientStubs.orderRisk.create.args[0][1];

    expect(shopifyClientStubs.orderRisk.create.args[0][1]).to.have
      .keys(['message', 'recommendation', 'score', 'source', 'cause_cancel', 'display']);
    expect(message).to.be.a('string');
    expect(recommendation).to.be.a('string');
    expect(score).to.be.a('number');
    expect(source).to.be.a('string');
    expect(cause_cancel).to.be.a('boolean');
    expect(display).to.be.a('boolean');
  });

  it('should translate Protect.risk to a shopify score and recommendation text', async () => {
    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.LOW,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    expect(shopifyClientStubs.orderRisk.create.args[0][1].score).to.equal(0);
    expect(shopifyClientStubs.orderRisk.create.args[0][1].recommendation).to.equal('accept');

    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.MEDIUM,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    expect(shopifyClientStubs.orderRisk.create.args[1][1].score).to.equal(0.5);
    expect(shopifyClientStubs.orderRisk.create.args[1][1].recommendation).to.equal('investigate');

    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.HIGH,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    expect(shopifyClientStubs.orderRisk.create.args[2][1].score).to.equal(1);
    expect(shopifyClientStubs.orderRisk.create.args[2][1].recommendation).to.equal('cancel');
  });

  it('should create secondary orderRisks from EQ8 & MIN_FRAUD fraud assessment factors', async () => {
    fraudAssessments.push(new FraudAssessment({
      providerType: ProviderType.EQ8,
      factors: [new RiskFactor({
        description: 'Test risk factor message',
      })],
    }));
    fraudAssessments.push(new FraudAssessment({
      providerType: ProviderType.MIN_FRAUD,
      factors: [new RiskFactor({
        description: 'Test risk factor message',
      })],
    }));
    fraudAssessments.push(new FraudAssessment({
      providerType: ProviderType.WHITE_PAGES,
      factors: [new RiskFactor({
        description: 'Test risk factor message',
      })],
    }));

    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.MEDIUM,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    expect(shopifyClientStubs.orderRisk.create.args).to.be.lengthOf(3);
    expect(shopifyClientStubs.orderRisk.create.args[0][1]).to.have.ownProperty('score');
    expect(shopifyClientStubs.orderRisk.create.args[1][1]).to.not.have.key('score');
    expect(shopifyClientStubs.orderRisk.create.args[2][1]).to.not.have.key('score');

    expect(shopifyClientStubs.orderRisk.create.args[1][1].message).to.match(/^Session - /);
    expect(shopifyClientStubs.orderRisk.create.args[2][1].message).to.match(/^Payment - /);
  });

  it('should only delete risks with an \"External\" source', async () => {
    const internalRiskCount: number = Math.ceil(Math.random() * 10);
    const externalRiskCount: number = Math.ceil(Math.random() * 10);

    const internalRisks: Partial<Shopify.IOrderRisk>[] = [];
    const externalRisks: Partial<Shopify.IOrderRisk>[] = [];

    for (let i = 0; i < internalRiskCount; i += 1) {
      internalRisks.push({ id: i, source: 'Internal' });
    }

    for (let i = 0; i < externalRiskCount; i += 1) {
      externalRisks.push({ id: i, source: 'External' });
    }

    shopifyClientStubs.orderRisk.list.resolves([
      ...internalRisks,
      ...externalRisks,
    ]);

    fraudAssessments.push(new FraudAssessment({
      providerType: ProviderType.EQ8,
      factors: [new RiskFactor({
        description: 'Test risk factor message',
      })],
    }));

    switchContext.data = new Order({
      fraudAssessments,
      platformId: Math.round(Math.random() * 1000000).toString(),
      risk: Risk.MEDIUM,
    });

    await setPlatformOrderRisk(switchContext, shopifyClientStubs);

    expect(shopifyClientStubs.orderRisk.delete.callCount).to.equal(externalRiskCount);
  });
});
