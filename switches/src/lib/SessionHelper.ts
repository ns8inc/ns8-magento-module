import { SwitchContext } from 'ns8-switchboard-interfaces';
import { MagentoClient } from '.';
import { Session } from 'ns8-protect-models';
import { Order } from '@ns8/magento2-rest-client';

export class SessionHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: Order;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: Order) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  //TODO: ship this data from Magento
  public toSession = (): Session => {
    return new Session({
      acceptLanguage: '',
      id: '',
      screenHeight: 0,
      screenWidth: 0,
      ip: '',
      userAgent: ''
    });
  }
}
