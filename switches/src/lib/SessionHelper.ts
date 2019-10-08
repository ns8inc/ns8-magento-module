import { MagentoClient } from '.';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { Session } from 'ns8-protect-models';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class SessionHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: MagentoOrder;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: MagentoOrder) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  //TODO: ship this data from Magento
  public toSession = (): Session => {
    return new Session({
      ip: '1.1.1.1',
    });
  }
}
