import { EventSwitch, SwitchContext } from 'ns8-switchboard-interfaces';

export class UpdateCustomer implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const { platformId } = switchContext.data;

    return {} as any;
  }
}
