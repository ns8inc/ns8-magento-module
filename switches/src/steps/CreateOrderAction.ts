import { CreateOrderActionSwitch } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
import { OrderHelper } from '..';
import { OrderState } from '../lib';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class CreateOrderAction implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    var converter = new OrderHelper(switchContext);
    if (converter.process(OrderState.CREATED)) {
      return await converter.createProtectOrder();
    } else {
      throw new Error('Cannot call Create Order unless the order is new.');
    }
  }
}
