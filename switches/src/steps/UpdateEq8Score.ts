import { SwitchContext, EventSwitch } from 'ns8-switchboard-interfaces';

export class UpdateEq8Score implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    const { platformId } = switchContext.data;

    return {} as any;
  }
}
