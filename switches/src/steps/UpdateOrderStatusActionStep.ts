/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateOrderStatusActionSwitch } from 'ns8-switchboard-interfaces';
import { OrderUpdate } from 'ns8-protect-models';
import { OrderUpdateHelper } from '../lib/OrderUpdateHelper';

/**
 * This is the stateless function that will execute the actual Magento switch logic.
 */
export class UpdateOrderStatusActionStep implements UpdateOrderStatusActionSwitch {
  async update(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    const converter = new OrderUpdateHelper(switchContext);
    return converter.processOrderUpdateAction();
  }
}

/**
 * This is the lambda that will execute the the step function.
 * This is the method that the serverless context will execute,
 * where this method name must match the corresponding method defined in `serverless.yml`
 */
export const UpdateOrderStatusAction: (event: any) => Promise<OrderUpdate> = ((): any =>
  new operatorModule.UpdateOrderStatusActionOperator([new UpdateOrderStatusActionStep()]).handle)();
