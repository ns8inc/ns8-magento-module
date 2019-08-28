import { readFileSync } from 'fs';
import Switchboard, { Source, Switch } from './Switchboard';

const switchboard: Switchboard = JSON.parse(readFileSync('./switchboard.json', 'utf8'));
const operatorModule = require('@ns8/ns8-switchboard-operator');

const instantiateHandler = (name: string) => {
  const switchboardSwitch: Switch = switchboard.switches
    .find((currSwitch: Switch) => currSwitch.name === name);

  const switches = switchboardSwitch.sources
    .map((source: Source) => {
      const module = require(source.moduleName);
      return new module[source.fileName]();
    });

  const operator = new operatorModule[switchboardSwitch.operator](switches);
  return operator['handle'];
};

const onInstallEventHandler = instantiateHandler('onInstallEvent');
const updateCustVerifyStatusEventHandler = instantiateHandler('updateCustVerifyStatusEvent');
const updateEQ8ScoreEventHandler = instantiateHandler('updateEQ8ScoreEvent');
const updateOrderRiskEventHandler = instantiateHandler('updateOrderRiskEvent');
const updateOrderStatusEventHandler = instantiateHandler('updateOrderStatusEvent');
const uninstallActionHandler = instantiateHandler('uninstallAction');
const createOrderActionHandler = instantiateHandler('createOrderAction');
const updateMerchantActionHandler = instantiateHandler('updateMerchantAction');
const updateOrderStatusActionHandler = instantiateHandler('updateOrderStatusAction');

export {
  onInstallEventHandler,
  updateCustVerifyStatusEventHandler,
  updateEQ8ScoreEventHandler,
  updateOrderRiskEventHandler,
  updateOrderStatusEventHandler,
  uninstallActionHandler,
  createOrderActionHandler,
  updateMerchantActionHandler,
  updateOrderStatusActionHandler,
};
