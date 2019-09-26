import { SwitchContext } from "ns8-switchboard-interfaces";
import { MagentoClient, SessionHelper } from ".";
import { LineItem } from "ns8-protect-models";

export class LineItemsHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;

  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
  }

  public toLineItems = (): LineItem[] => {

    return [];
  }

}
