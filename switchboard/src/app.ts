
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


const CreateOrder = instantiateHandler('CreateOrder');
const Install = instantiateHandler('Install');
const UpdateCustomerVerificationStatus = instantiateHandler('UpdateCustomerVerificationStatus');
const UpdateEQ8Score = instantiateHandler('UpdateEQ8Score');
const UpdateOrderRisk = instantiateHandler('UpdateOrderRisk');
const Uninstall = instantiateHandler('Uninstall');
const UpdateMerchant = instantiateHandler('UpdateMerchant');
const UpdateOrderStatus = instantiateHandler('UpdateOrderStatus');

export {
  CreateOrder,
  Install,
  UpdateCustomerVerificationStatus,
  UpdateEQ8Score,
  UpdateOrderRisk,
  Uninstall,
  UpdateMerchant,
  UpdateOrderStatus
};
