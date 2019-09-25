import { SwitchContext, EventSwitch } from "ns8-switchboard-interfaces";

export class Install implements EventSwitch {
  handle = async (switchContext: SwitchContext): Promise<any> => {
    const { actions }: { actions: any } = switchContext.data;
  }
}