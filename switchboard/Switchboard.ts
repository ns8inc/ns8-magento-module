import { Switchboard, } from 'ns8-switchboard-interfaces';
import platformSwitchboardJson from './switchboard.json';
const platformSwitchboard = platformSwitchboardJson as unknown as Switchboard;

export {
  platformSwitchboard
}
