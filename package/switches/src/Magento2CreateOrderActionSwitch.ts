import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';

export class Magento2CreateOrderActionSwitch implements CreateOrderActionSwitch {
  async create(switchContext: any): Promise<Order> {
    console.log(switchContext);
    return new Order();
  }
}