import { expect } from 'chai';
import { FraudAssessment, ProviderType } from 'ns8-protect-models';
import { getScoreText } from '../../src/getPlatformOrderDetails';

describe('getScoreText', () => {
  const fraudAssessments: FraudAssessment[] = [];

  afterEach(() => {
    fraudAssessments.length = 0;
  });

  it('should return \'None\' when no FraudAssessments are provided', () => {
    expect(getScoreText(null)).to.equal('None');
  });

  it('should return \'None\' when FraudAssessment array is empty', () => {
    expect(getScoreText(fraudAssessments)).to.equal('None');
  });

  it('should return \'None\' when there is not an EQ8 FraudAssessment', () => {
    fraudAssessments.push(new FraudAssessment());
    fraudAssessments.push(new FraudAssessment({ providerType: ProviderType.MIN_FRAUD }));
    fraudAssessments.push(new FraudAssessment({ providerType: ProviderType.WHITE_PAGES }));

    expect(getScoreText(fraudAssessments)).to.equal('None');
  });

  it('should return \'None\' when there is an EQ8 FraudAssessment but no score', () => {
    fraudAssessments.push(new FraudAssessment({ providerType: ProviderType.EQ8 }));

    expect(getScoreText(fraudAssessments)).to.equal('None');
  });

  it('should return the score value as a string when there is an EQ8 FraudAssessment with a score', () => {
    const score = Math.round(Math.random() * 1000);

    fraudAssessments.push(new FraudAssessment({
      score,
      providerType: ProviderType.EQ8,
    }));

    expect(getScoreText(fraudAssessments)).to.equal(score.toString());
  });
});
