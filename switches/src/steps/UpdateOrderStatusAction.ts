import { NamedOrderHelper } from '..';
import { NamedOrderUpdate } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';
import { UpdateOrderStatusActionSwitch } from 'ns8-switchboard-interfaces';

export class UpdateOrderStatusAction implements UpdateOrderStatusActionSwitch {
  async update(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    const converter = new NamedOrderHelper(switchContext);
    return converter.processOrderUpdate();
  }
}
