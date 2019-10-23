import { EventSwitch } from 'ns8-switchboard-interfaces';
import { OrderUpdateHelper } from '..';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class UpdateOrderStatusEvent implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    const converter = new OrderUpdateHelper(switchContext);
    return converter.processOrderUpdateEvent();
  }
}
