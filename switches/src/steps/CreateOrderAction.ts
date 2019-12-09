import {
  CreateOrderActionSwitch,
  SwitchContext
} from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
import { OrderHelper } from '..';

export class CreateOrderAction implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    const converter = new OrderHelper(switchContext);
    return converter.createProtectOrder();
  }
}
