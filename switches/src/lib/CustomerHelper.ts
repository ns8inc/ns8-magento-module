import { SwitchContext } from "ns8-switchboard-interfaces";
import { MagentoClient, SessionHelper } from ".";
import { Customer } from "ns8-protect-models";

export class CustomerHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
  }

  public toCustomer = (): Customer => {

    return new Customer();
  }

}
