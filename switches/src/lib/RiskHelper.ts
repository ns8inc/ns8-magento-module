import { MagentoClient } from '.';
import { Risk } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class RiskHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
  }

  public toRisk = (): Risk => {

    return Risk.LOW;
  }

}
