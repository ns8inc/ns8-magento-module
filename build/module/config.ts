import { existsSync, mkdirSync, copyFileSync } from 'fs';
import minimist from 'minimist';

const destFolder = 'module/etc/integration';
const configDest = `${destFolder}/config.xml`;

const placeConfig = (env) => {
  if (env !== 'dev' && env !== 'prod') {
    console.error(env);
    throw new Error('No matching env');
  }
  if (!existsSync(destFolder)) {
    mkdirSync(destFolder, {
      recursive: true,
    });
  }
  copyFileSync(`build/module/etc/integration/config.${env}.xml`, configDest);
};

const args = minimist(process.argv.slice(2));
const { env } = args;
placeConfig(env);
