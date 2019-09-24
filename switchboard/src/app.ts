import { SwitchboardInit } from '@ns8/ns8-protect-sdk';
import switchboardJson from '../switchboard.json';
import { Switchboard } from 'ns8-switchboard-interfaces';

const switchboard = switchboardJson as unknown as Switchboard
SwitchboardInit.installModules(switchboard);

const createOrderActionHandler = SwitchboardInit.instantiateHandler(switchboard, 'createOrderAction');

export {
  createOrderActionHandler
};
