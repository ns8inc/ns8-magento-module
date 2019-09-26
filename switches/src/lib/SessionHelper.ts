import { SwitchContext } from 'ns8-switchboard-interfaces';
import { MagentoClient } from '.';
import { Session } from 'ns8-protect-models';

export class SessionHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
  }

  public toSession = (): Session => {
    return new Session({
      acceptLanguage: this.SwitchContext.,
      id: '',
      screenHeight: 0,
      screenWidth: 0,
      ip: '',
      userAgent: ''
    });
  }
}
