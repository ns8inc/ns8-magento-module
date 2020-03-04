/* eslint-disable no-console */
import { execSync } from 'child_process';
import { env } from './loadEnv';

let stage = 'test';
if (process.env.NODE_ENV?.toLowerCase().startsWith('prod')) {
  stage = 'prod';
} else if (process.env.NODE_ENV?.toLowerCase().startsWith('test')) {
  stage = 'test';
} else if (process.env.DEV_SUFFIX) {
  stage = process.env.DEV_SUFFIX;
}
const method = (process.env.METHOD || 'deploy').trim().toLowerCase();
if (method !== 'deploy' && method !== 'remove') throw new Error(`Method ${method} is not supported`);

const command = `sls ${method} --stage=${stage}`;
const cwd = `${process.cwd()}`;
console.info(`Running ${command} in ${cwd}`);

try {
  execSync(command, { cwd, stdio: 'inherit' });
} catch (error) {
  console.error(error);
  console.info(env);
}
