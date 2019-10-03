import { NamedOrderUpdate, SwitchContext, UpdateOrderStatusActionSwitch } from 'ns8-switchboard-interfaces';

export class UpdateOrderStatusEvent implements UpdateOrderStatusActionSwitch {
  async update(switchContext: SwitchContext): Promise<NamedOrderUpdate> {
    return {} as any;
  }
}
