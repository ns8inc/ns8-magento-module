import { SwitchContext } from 'ns8-switchboard-interfaces';
import { MagentoClient, SessionHelper } from '.';
import { Customer } from 'ns8-protect-models';
import { Order } from '@ns8/magento2-rest-client';
export class CustomerHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: Order;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient, magentoOrder: Order) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = magentoOrder;
  }

  public toCustomer = (): Customer => {

    return new Customer();
  }

}
