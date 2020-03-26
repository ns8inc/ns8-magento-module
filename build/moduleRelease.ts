/* eslint-disable @typescript-eslint/no-var-requires, no-console */
import { createWriteStream, existsSync, lstatSync, mkdirSync, readdirSync, rmdirSync, unlinkSync } from 'fs';
import * as Path from 'path';

const archiver = require('archiver');
const composer = require('../composer.json');

const deleteFolderRecursive = (path): void => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file) => {
      const curPath = Path.join(path, file);
      if (lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
};

/**
 * Generates a zip file with the right naming conventions
 * see {@link https://devdocs.magento.com/guides/v2.3/extension-dev-guide/package/package_module.html#packaging}
 */
export const moduleRelease = (): void => {
  // Cleanup any old zip files we may have
  deleteFolderRecursive('release');
  mkdirSync('release');

  const fileName = `release/NS8_Protect-${composer.version}.zip`;
  const output = createWriteStream(fileName);
  const archive = archiver('zip');

  output.on('close', () => {
    console.log(`${fileName}: ${archive.pointer()} total bytes`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.glob('**/**', {
    cwd: '',
    ignore: ['**/vendor/**'],
  });
  archive.finalize();
};

try {
  moduleRelease();
} catch (error) {
  console.error(error);
}
