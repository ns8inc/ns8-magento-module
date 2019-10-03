
import { platformSwitchboard as switchboard } from '../Switchboard';
import { Switch, Source, Switchboard } from 'ns8-switchboard-interfaces';
import * as operatorModule from '@ns8/ns8-switchboard-operator';

debugger;

const instantiateHandler = (name: string) => {
  const switchboardSwitch: Switch | null = switchboard.switches
    .find((currSwitch: Switch) => currSwitch.name === name) || null;

  if (null == switchboardSwitch) throw new Error(`No switch found for ${name}`);

  if (null == switchboardSwitch.sources) throw new Error('No sources defined on Switchboard');

  const switches = switchboardSwitch.sources
    .map((source: Source) => {
      const module = require(source.moduleName);
      return new module[source.fileName]();
    });

  if (null == switchboardSwitch.operator) throw new Error('No operator defined on Switchboard');

  const operator = new operatorModule[switchboardSwitch.operator](switches);
  return operator.handle;
};


const CreateOrderAction = instantiateHandler('CreateOrderAction');
const OnInstallEvent = instantiateHandler('OnInstallEvent');
const UpdateCustVerifyStatusEvent = instantiateHandler('UpdateCustVerifyStatusEvent');
const UpdateEQ8ScoreEvent = instantiateHandler('UpdateEQ8ScoreEvent');
const UpdateOrderRiskEvent = instantiateHandler('UpdateOrderRiskEvent');
const UninstallAction = instantiateHandler('UninstallAction');
const UpdateMerchantAction = instantiateHandler('UpdateMerchantAction');
const UpdateOrderStatusEvent = instantiateHandler('UpdateOrderStatusEvent');

export {
  CreateOrderAction,
  OnInstallEvent,
  UpdateCustVerifyStatusEvent,
  UpdateEQ8ScoreEvent,
  UpdateOrderRiskEvent,
  UninstallAction,
  UpdateMerchantAction,
  UpdateOrderStatusEvent
};
