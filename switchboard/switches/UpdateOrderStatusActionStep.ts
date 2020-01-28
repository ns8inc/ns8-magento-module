import { UpdateOrderStatusActionOperator } from '@ns8/ns8-switchboard-operator';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateOrderStatusActionSwitch } from 'ns8-switchboard-interfaces';
import { OrderUpdate } from 'ns8-protect-models';
import { OrderUpdateHelper } from '../lib/OrderUpdateHelper';

/**
 * This is the stateless function that will execute the actual Magento switch logic.
 */
export class UpdateOrderStatusActionStep implements UpdateOrderStatusActionSwitch {
  // eslint-disable-next-line class-methods-use-this
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UpdateOrderStatusAction: (event: any) => Promise<OrderUpdate> = ((): any =>
  new UpdateOrderStatusActionOperator([new UpdateOrderStatusActionStep()]).handle)();
