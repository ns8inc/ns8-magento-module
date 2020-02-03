/* eslint-disable no-console */
import { execSync } from 'child_process';
import { env } from './loadEnv';

const stage = process.env.DEV_SUFFIX ? process.env.DEV_SUFFIX : 'dev';
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
