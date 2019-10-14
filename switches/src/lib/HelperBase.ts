import { Logger } from '@ns8/ns8-protect-sdk';
import { MagentoClient } from '.';
import { Order as MagentoOrder } from '@ns8/magento2-rest-client';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class HelperBase {
  public SwitchContext: SwitchContext;
  public MagentoClient: MagentoClient;
  public MagentoOrder: MagentoOrder;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: MagentoOrder) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  public log = Logger.log;
  public error = Logger.error;
}
