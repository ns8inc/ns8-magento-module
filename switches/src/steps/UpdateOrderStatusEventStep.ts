/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { EventSwitch } from 'ns8-switchboard-interfaces';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { OrderUpdate } from 'ns8-protect-models';
import { OrderUpdateHelper } from '../lib/OrderUpdateHelper';

export class UpdateOrderStatusEventStep implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    const converter = new OrderUpdateHelper(switchContext);
    return converter.processOrderUpdateEvent();
  }
}

export const UpdateOrderStatusEvent: (event: any) => Promise<OrderUpdate> = ((): any =>
  new operatorModule.EventOperator([new UpdateOrderStatusEventStep()]).handle)();
