import { CreateOrderActionSwitch } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
import { OrderHelper } from '..';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class CreateOrderAction implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    var converter = new OrderHelper(switchContext);
    return converter.createProtectOrder();
  }
}
