import { Risk } from 'ns8-protect-models';
import { HelperBase } from '..';

export class RiskHelper extends HelperBase {
  public toRisk = (): Risk => {
    return Risk.LOW;
  };
}
