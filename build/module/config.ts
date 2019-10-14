import { existsSync, mkdirSync, copyFileSync } from 'fs';
require('dotenv').config();

const destFolder = 'module/etc/integration';
const configDest = `${destFolder}/config.xml`;

const placeConfig = () => {
  let env = 'prod';
  if (process.env.NODE_ENV !== 'prod') {
    env = 'dev';
  }
  if (!existsSync(destFolder)) {
    mkdirSync(destFolder, {
      recursive: true,
    });
  }
  copyFileSync(`build/module/etc/integration/config.${env}.xml`, configDest);
  console.info(`Set integration XML. Copied build/module/etc/integration/config.${env}.xml to ${configDest}.`)
};

placeConfig();
