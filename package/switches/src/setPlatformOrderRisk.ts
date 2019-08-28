import * as Shopify from 'shopify-api-node';
import { SwitchContext } from 'ns8-switchboard-interfaces';

const setPlatformOrderRisk = async (switchContext: SwitchContext, client: Shopify): Promise<Shopify.IOrderRisk[]> => {
  const {
    fraudAssessments,
    platformId,
    risk,
  } = switchContext.data;

  const orderId = parseInt(platformId, 10);

  const score = {
    LOW: 0.0,
    MEDIUM: 0.5,
    HIGH: 1.0,
  };

  const recommendation = {
    LOW: 'accept',
    MEDIUM: 'investigate',
    HIGH: 'cancel',
  };

  const primaryOrderRisk: Partial<Shopify.IOrderRisk> = {
    message: `Protect has assigned a risk of ${risk}`,
    recommendation: recommendation[risk],
    score: parseFloat(score[risk]),
    source: 'External',
    cause_cancel: false,
    display: true,
  };

  const riskPrefix = {
    EQ8: 'Session',
    MIN_FRAUD: 'Payment',
  };

  const existingOrderRisks: Shopify.IOrderRisk[] = await client.orderRisk.list(orderId);

  // Delete all existing Shopify order risk objects
  await Promise.all(existingOrderRisks
    .filter((orderRisk) => orderRisk.source === 'External')
    .map((orderRisk) => client.orderRisk.delete(orderId, orderRisk.id)));

  // This is the HIGH, MEDIUM, LOW risk factor that includes a numeric score.
  await client.orderRisk.create(orderId, primaryOrderRisk);

  // Get all fraud assessment factors and create a new orderRisk for each. These don't have numeric scores.
  return await Promise.all(fraudAssessments
    .filter((fraudAssessment) => (
      fraudAssessment.providerType === 'EQ8' || fraudAssessment.providerType === 'MIN_FRAUD'
    )).map((fraudAssessment) => (
      fraudAssessment.factors
        .map((factor) => (
          client.orderRisk.create(
            orderId, {
              message: `${riskPrefix[fraudAssessment.providerType]} - ${factor.description}`,
              recommendation: recommendation[risk],
              source: 'External',
              cause_cancel: 'false',
              display: true,
            })
        ))
    )).reduce((acc, factor) => acc.concat(factor), []));
};

export default setPlatformOrderRisk;
