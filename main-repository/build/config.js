const fs = require('fs');
const minimist = require('minimist');

const destFolder = 'src/etc/integration';
const configDest = `${destFolder}/config.xml`;
const apiDest = `${destFolder}/api.xml`;


const placeConfig = (env) => {
  if (env !== 'dev' && env !== 'prod') {
    console.error(env);
    throw new Error('No matching env');
  }
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, {
      recursive: true,
    });
  }
  fs.copyFileSync(`build/etc/integration/config.${env}.xml`, configDest);
  fs.copyFileSync(`build/etc/integration/api.${env}.xml`, apiDest);
};

const args = minimist(process.argv.slice(2));
const { env } = args;
placeConfig(env);
