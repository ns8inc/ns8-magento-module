import composer from '../module/composer.json';
import rimraf from 'rimraf';
import { createWriteStream, mkdirSync } from 'fs';
const archiver = require('archiver');

/**
 * Generates a zip file with the right naming conventions
 * @see https://devdocs.magento.com/guides/v2.3/extension-dev-guide/package/package_module.html#packaging
 */
export const moduleRelease = () => {
  // Cleanup any old zip files we may have
  rimraf.sync('release');
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
    cwd: 'module',
    ignore: ['**/vendor/**']
  });
  archive.finalize();
}

try {
  moduleRelease();
} catch (error) {
  console.error(error);
}