import { EventSwitch } from 'ns8-switchboard-interfaces';
import { SwitchContext } from 'ns8-switchboard-interfaces';

export class UpdateCustomer implements EventSwitch {
  async handle(switchContext: SwitchContext): Promise<any> {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { platformId } = switchContext.data;

    return {} as any;
  }
}
