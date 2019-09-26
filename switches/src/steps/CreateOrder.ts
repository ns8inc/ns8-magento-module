import { Order } from 'ns8-protect-models';
import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import { OrderHelper } from '..'

export class CreateOrder implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {

    var converter = new OrderHelper(switchContext);
    return await converter.toOrder();
  }
}
