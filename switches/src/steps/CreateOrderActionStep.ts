/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { CreateOrderActionSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
import { OrderHelper } from '../lib/OrderHelper';

/**
 * This is the state that will execute
 */
export class CreateOrderActionStep implements CreateOrderActionSwitch {
  async create(switchContext: SwitchContext): Promise<Order> {
    const converter = new OrderHelper(switchContext);
    return converter.createProtectOrder();
  }
}

export const CreateOrderAction: (event: any) => Promise<Order> = ((): any =>
  new operatorModule.CreateOrderActionOperator([new CreateOrderActionStep()]).handle)();
