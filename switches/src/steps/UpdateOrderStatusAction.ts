import {
  NamedOrderUpdate,
  SwitchContext,
  UpdateOrderStatusActionSwitch
} from 'ns8-switchboard-interfaces';

import { OrderUpdateHelper } from '..';

export class UpdateOrderStatusAction implements UpdateOrderStatusActionSwitch {
  async update(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    const converter = new OrderUpdateHelper(switchContext);
    return converter.processOrderUpdateAction();
  }
}
