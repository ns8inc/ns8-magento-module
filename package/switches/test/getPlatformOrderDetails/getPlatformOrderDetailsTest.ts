import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  CustomerVerification,
  CustomerVerificationStatus,
  FraudAssessment,
  Order,
  ProviderType,
  Risk,
  Status,
} from 'ns8-protect-models';
import * as getPlatformOrderDetails from '../../src/getPlatformOrderDetails';
import * as client from '../../src/getShopifyClient';
import { PlatformOrderDetails } from '../../src/types';
import * as Shopify from 'shopify-api-node';

describe('getPlatformOrderDetails', async () => {
  const score = Math.round(Math.random() * 1000);
  const order: Order = new Order({
    risk: Risk.MEDIUM,
    status: Status.APPROVED,
    customerVerification: new CustomerVerification({ status: CustomerVerificationStatus.SMS_VERIFIED }),
    fraudAssessments: [new FraudAssessment({
      score,
      providerType: ProviderType.EQ8,
    })],
  });

  let shopifyClientFakes;
  let platformOrderDetails: PlatformOrderDetails;

  describe('orders with existing NS8 and third-party note_attributes', () => {
    const existingNoteAttributes: Shopify.IDraftOrderNoteAttribute[] = [
      {
        name: 'NS8 Status',
        value: Status.MERCHANT_REVIEW,
      },
      {
        name: 'NS8 Order Risk',
        value: Risk.LOW,
      },
      {
        name: 'NS8 EQ8 Score',
        value: '0',
      },
      {
        name: 'NS8 Customer Verification',
        value: CustomerVerificationStatus.SMS_SEND,
      },
      {
        name: 'Third Party Note Attribute',
        value: 'Important to persist',
      },
      {
        name: 'Another Third Party Note Attribute',
        value: 'Also important to persist',
      },
    ];

    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: existingNoteAttributes }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with both NS8 and third-party keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
        'Third Party Note Attribute',
        'Another Third Party Note Attribute',
      ]);
    });

    it('should have an expected Status value', () => {
      expect(platformOrderDetails.note_attributes['NS8 Status']).to.equal('Approved');
    });

    it('should have an expected Risk value', () => {
      expect(platformOrderDetails.note_attributes['NS8 Order Risk']).to.equal('Medium');
    });

    it('should have an expected EQ8 Score value', () => {
      expect(platformOrderDetails.note_attributes['NS8 EQ8 Score']).to.equal(score.toString());
    });

    it('should have an expected Customer Verification value', () => {
      expect(platformOrderDetails.note_attributes['NS8 Customer Verification']).to.equal('Verified');
    });
  });

  describe('orders with existing NS8 and NO third-party note_attributes', () => {
    const existingNoteAttributes: Shopify.IDraftOrderNoteAttribute[] = [
      {
        name: 'NS8 Status',
        value: Status.MERCHANT_REVIEW,
      },
      {
        name: 'NS8 Order Risk',
        value: Risk.LOW,
      },
      {
        name: 'NS8 EQ8 Score',
        value: '0',
      },
      {
        name: 'NS8 Customer Verification',
        value: CustomerVerificationStatus.SMS_SEND,
      },
    ];

    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: existingNoteAttributes }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with only NS8 keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
      ]);
    });
  });

  describe('orders with third-party and NO NS8 note_attributes', () => {
    const existingNoteAttributes: Shopify.IDraftOrderNoteAttribute[] = [
      {
        name: 'Third Party Note Attribute',
        value: 'Important to persist',
      },
      {
        name: 'Another Third Party Note Attribute',
        value: 'Also important to persist',
      },
    ];

    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: existingNoteAttributes }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with both NS8 and third-party keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
        'Third Party Note Attribute',
        'Another Third Party Note Attribute',
      ]);
    });
  });

  describe('orders without any existing note_attributes', () => {
    const existingNoteAttributes: Shopify.IDraftOrderNoteAttribute[] = [];

    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: existingNoteAttributes }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with only NS8 keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
      ]);
    });
  });

  describe('orders with existing NS8 and legacy NS8 attributes', () => {
    const existingNoteAttributes: Shopify.IDraftOrderNoteAttribute[] = [
      {
        name: 'NS8 Status',
        value: Status.MERCHANT_REVIEW,
      },
      {
        name: 'NS8 Order Risk',
        value: Risk.LOW,
      },
      {
        name: 'NS8 EQ8 Score',
        value: '0',
      },
      {
        name: 'NS8 Customer Verification',
        value: CustomerVerificationStatus.SMS_SEND,
      },
      {
        name: 'EQ8 Score',
        value: 'This should go away',
      },
      {
        name: 'Customer Verification',
        value: 'Also should go away',
      },
    ];

    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: existingNoteAttributes }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with NS8 keys and NO legacy NS8 keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
      ]);
      expect(platformOrderDetails).to.not.have.keys(['EQ8 Score', 'Customer Verification']);
    });
  });

  describe('orders with existing NS8, legacy NS8 and third-party attributes', () => {
    const existingNoteAttributes: Shopify.IDraftOrderNoteAttribute[] = [
      {
        name: 'NS8 Status',
        value: Status.MERCHANT_REVIEW,
      },
      {
        name: 'NS8 Order Risk',
        value: Risk.LOW,
      },
      {
        name: 'NS8 EQ8 Score',
        value: '0',
      },
      {
        name: 'NS8 Customer Verification',
        value: CustomerVerificationStatus.SMS_SEND,
      },
      {
        name: 'EQ8 Score',
        value: 'This should go away',
      },
      {
        name: 'Customer Verification',
        value: 'Also should go away',
      },
      {
        name: 'Third Party Note Attribute',
        value: 'Important to persist',
      },
      {
        name: 'Another Third Party Note Attribute',
        value: 'Also important to persist',
      },
    ];

    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: existingNoteAttributes }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with NS8 keys and third-party keys, but NO legacy NS8 keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
        'Third Party Note Attribute',
        'Another Third Party Note Attribute',
      ]);
      expect(platformOrderDetails).to.not.have.keys(['EQ8 Score', 'Customer Verification']);
    });
  });

  describe('Error retrieving existing order attributes', () => {
    beforeEach(async () => {
      shopifyClientFakes = {
        order: {
          get: sinon.fake.resolves({ note_attributes: new Error() }),
        },
      };

      sinon.replace(client, 'default', sinon.fake.returns(shopifyClientFakes));

      sinon.replace(console, 'log', sinon.fake());

      platformOrderDetails = await getPlatformOrderDetails.default(order, shopifyClientFakes);

      sinon.restore();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return a PlatformOrderDetails object with only NS8 keys', () => {
      expect(platformOrderDetails).to.have.ownProperty('note_attributes');
      expect(platformOrderDetails.note_attributes).to.have.all.keys([
        'NS8 Status',
        'NS8 Order Risk',
        'NS8 EQ8 Score',
        'NS8 Customer Verification',
      ]);
    });
  });
});
