import {
  Order,
  ProviderType,
  FraudAssessment,
  CustomerVerification,
  Risk,
  Status,
} from 'ns8-protect-models';
import { PlatformOrderDetails } from './types';
import * as Shopify from 'shopify-api-node';

const getRiskText = (risk: Risk): string => {
  const displayText = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  };

  return displayText[risk.toUpperCase()] || 'None';
};

const getStatusText = (status: Status): string => {
  const displayText = {
    APPROVED: 'Approved',
    MERCHANT_REVIEW: 'Merchant Review',
    CANCELLED: 'Canceled',
  };

  return displayText[status.toUpperCase()] || 'None';
};

const getScoreText = (fraudAssessments: FraudAssessment[]): string => {
  let score = 'None';

  if (fraudAssessments) {
    const eq8Assessment: FraudAssessment = fraudAssessments
      .find((item) => item.providerType === ProviderType.EQ8);

    if (eq8Assessment && typeof eq8Assessment.score === 'number') {
      score = eq8Assessment.score.toString();
    }
  }

  return score;
};

const getCustomerVerificationText = (customerVerification: CustomerVerification): string => {
  let verificationStatus = 'None';

  if (customerVerification && customerVerification.status) {
    const { status } = customerVerification;
    const displayText = {
      EMAIL_SENT: 'Email Sent',
      CUSTOMER_DENIED: 'Failed',
      SMS_SEND: 'SMS Sent',
      SMS_VERIFIED: 'Verified',
    };

    verificationStatus = displayText[status.toUpperCase()];
  }

  return verificationStatus;
};

const getExistingNotes =
  async (client: Shopify, orderId: number): Promise<Shopify.IDraftOrderNoteAttribute[] | Error> => {
    const order: Shopify.IOrder | Error = await client.order.get(orderId, { fields: 'note_attributes' })
      .catch((error) => new Error(`Could not fetch note_attributes: ${JSON.stringify(error)}`));

    let noteAttributes: Shopify.IDraftOrderNoteAttribute[] = [];

    if (!(order instanceof Error) && order && order.note_attributes) {
      noteAttributes = order.note_attributes;
    }

    return noteAttributes;
  };

const filterNonNS8Notes = (notes: Shopify.IDraftOrderNoteAttribute[]): Shopify.IDraftOrderNoteAttribute[] => (
  notes
    .filter((note) => !note.name.startsWith('NS8'))
    .filter((note) => note.name !== 'EQ8 Score' && note.name !== 'Customer Verification')
);

const getPlatformOrderDetails = async (order: Order, client: Shopify): Promise<PlatformOrderDetails> => {
  const {
    risk,
    status,
    customerVerification,
    fraudAssessments,
  } = order;

  const existingNotes: Shopify.IDraftOrderNoteAttribute[] | Error =
    await getExistingNotes(client, parseInt(order.platformId, 10));

  const nonNS8Notes = {};

  if (!(existingNotes instanceof Error)) {
    filterNonNS8Notes(existingNotes).forEach((note) => {
      nonNS8Notes[note.name] = note.value;
    });
  } else {
    console.log('Error retrieving existing note_attributes.', existingNotes);
  }

  return {
    note_attributes: {
      'NS8 Status': getStatusText(status),
      'NS8 Order Risk': getRiskText(risk),
      'NS8 EQ8 Score': getScoreText(fraudAssessments),
      'NS8 Customer Verification': getCustomerVerificationText(customerVerification),
      ...nonNS8Notes,
    },
  };
};

export {
  getRiskText,
  getStatusText,
  getScoreText,
  getCustomerVerificationText,
};
export default getPlatformOrderDetails;
