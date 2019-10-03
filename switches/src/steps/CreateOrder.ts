import { Order } from 'ns8-protect-models';
import { CreateOrderActionSwitch, SwitchContext } from 'ns8-switchboard-interfaces';
import { OrderHelper } from '..'
import { OrderState } from '../lib';

export class CreateOrder implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    var converter = new OrderHelper(switchContext);
    if (converter.process(OrderState.CREATED)) {
      return await converter.createProtectOrder();
    } else {
      throw new Error('Cannot call Create Order unless the order is new.');
    }
  }
}
