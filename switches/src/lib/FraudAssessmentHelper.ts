import { FraudAssessment } from 'ns8-protect-models';
import { MagentoClient } from '.';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class FraudAssessmentHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
  }

  public toFraudAssessment = (): FraudAssessment[] => {

    return [];
  }

}
