const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const filename = './switchboard.json';
console.log('filename is ', filename);
const switchboard = JSON.parse(fs.readFileSync(filename));

const logAndExit = (error) => {
    console.error(error);
    process.exit(1);
};

const installModules = async (switchboard) => {
  for (const module of switchboard.modules) {
      if(module.version === 'link') {
          const dependency = module.name;
          console.log(`running yarn link ${dependency}`);
          await exec(`yarn link ${dependency}`).catch(logAndExit);
      } else {
          const dependency = module.name + "@" + module.version;
          console.log(`running yarn add ${dependency}`);
          await exec(`yarn add ${dependency}`).catch(logAndExit);
      }
  }
};

installModules(switchboard);