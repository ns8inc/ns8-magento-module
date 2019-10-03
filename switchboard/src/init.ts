
import { platformSwitchboard as switchboard } from '../Switchboard';
import { Switchboard } from 'ns8-switchboard-interfaces';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const logAndExit = (error): void => {
  console.error(error);
  process.exit(1);
};

/**
 * Dynamically install modules
 */
const installModules = async (switchboard: Switchboard): Promise<void> => {
  if (null == switchboard.modules) throw new Error('No modules defined on Switchboard');

  for (const mdl of switchboard.modules) {
    if (mdl.version === 'link') {
      const dependency = mdl.name;
      console.log(`running yarn link ${dependency}`);
      await exec(`yarn link ${dependency}`).catch(logAndExit);
    } else {
      const dependency = mdl.name + '@' + mdl.version;
      console.log(`running yarn add ${dependency}`);
      await exec(`yarn add ${dependency}`).catch(logAndExit);
    }
  }
};

installModules(switchboard);
