import { SwitchContext } from "ns8-switchboard-interfaces";
import { MagentoClient, SessionHelper } from ".";
import { Address } from "ns8-protect-models";
import { Order } from '@ns8/magento2-rest-client';
import { toProtectAddressType } from "./util";
import { get } from 'lodash';

export class AddressHelper {
  private SwitchContext: SwitchContext;
  private MagentoClient: MagentoClient;
  private MagentoOrder: Order;
  constructor(switchContext: SwitchContext, magentoClient: MagentoClient) {
    this.SwitchContext = switchContext;
    this.MagentoClient = magentoClient;
    this.MagentoOrder = switchContext.data.order as Order;
  }

  public toAddresses = (): Address[] => {
    const ret: Address[] = [];
    this.MagentoOrder.extension_attributes.shipping_assignments.forEach((assignment) => {
      var address = new Address({
        type: toProtectAddressType(assignment.shipping.address.address_type)

      });
      address.address1 = get(assignment, 'shipping.address.street[0]');
      address.address2 = get(assignment, 'shipping.address.street[1]');
      ret.push(address);
    });

    return ret;
  }

}
