import { CreateOrderActionSwitch as ICreateOrderActionSwitch, SwitchContext as ISwitchContext } from 'ns8-switchboard-interfaces';
import { Order } from 'ns8-protect-models';
export declare class CreateOrderActionSwitch implements ICreateOrderActionSwitch {
    create(switchContext: ISwitchContext): Promise<Order>;
}
