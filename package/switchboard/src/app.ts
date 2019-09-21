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

const createOrderActionHandler = instantiateHandler('createOrderAction');

export {
  createOrderActionHandler
};
