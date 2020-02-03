import { FraudAssessment, ProviderType } from 'ns8-protect-models';
import { OrderHelper } from './OrderHelper';

export class ScoreHelper extends OrderHelper {
  public processScore = async (): Promise<void> => {
    const assessments: FraudAssessment[] = this.SwitchContext.data.fraudAssessments as FraudAssessment[];
    const eq8Match = assessments.find((a) => a.providerType === ProviderType.EQ8);
    if (eq8Match && eq8Match.score) {
      const magentoOrder = await this.getMagentoOrder();
      await this.MagentoClient.postScore(`${magentoOrder.entity_id}`, eq8Match.score);
    }
  };
}
