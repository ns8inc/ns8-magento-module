import { CreateOrderActionSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
import { OrderHelper } from '../lib/OrderHelper';

export class CreateOrderAction implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    const converter = new OrderHelper(switchContext);
    return converter.createProtectOrder();
  }
}
