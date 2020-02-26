/* eslint-disable no-console */
import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export async function getLatestVersion(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.status.toString().startsWith('2')) {
      console.log(`Failed to fetch latest Magento version from the magento2 github url [ ${url} ].`);
      console.log(`Github API Response: ${response.statusText}`);

      return '';
    }

    const [latest] = await response.json();
    return latest.name;
  } catch (e) {
    throw new Error(`Fetching latest Magento tags from ${url} failed. More information: ${e}.`);
  }
}

async function setTargetVersion(newVersion: string, filepaths: string[]): Promise<void> {
  filepaths.forEach((filepath) => {
    let scriptContent;

    try {
      scriptContent = readFileSync(filepath, 'utf8');
    } catch (e) {
      console.log(`Failed to read file: ${filepath}.`);
      throw new Error(e);
    }

    const match = /MAGENTO_VERSION=(.*)/.exec(scriptContent) || [];
    const previousVersion = match[1];
    const scriptWithNewVersionNumber = scriptContent.replace(/(MAGENTO_VERSION=).*/, `$1${newVersion}`);

    console.log(`\nUpdating file: ${filepath}...`);
    if (previousVersion) {
      console.log(`- Previous magento version was: ${previousVersion}.`);
    }
    console.log(`- Magento version is now: ${newVersion}.\n`);

    try {
      writeFileSync(filepath, scriptWithNewVersionNumber);
    } catch (e) {
      console.log(`Failed to write new Magento version to ${filepath}.`);
      throw new Error(e);
    }
  });
}

export default async function main(version: string, filepaths: string[]): Promise<void> {
  const magentoTagsUrl = 'https://api.github.com/repos/magento/magento2/tags';
  const targetVersion = version === 'latest' ? await getLatestVersion(magentoTagsUrl) : version;
  setTargetVersion(targetVersion, filepaths);
}

if (__filename === process.mainModule?.filename) {
  const args = process.argv.slice(2);
  const [flag, version] = args;
  const usage = `
    usage: setMagentoVersion -v <semver string>
    e.g. setMagentoVersion -v 2.4.3`;

  if (flag === '-v' && (version || '').length > 0) {
    const filepaths = [join(__dirname, '../scripts/lightsail-setup.sh'), join(__dirname, '../scripts/testbox')];
    main(version, filepaths);
  } else if (flag === '-h') {
    console.log(usage);
    process.exit(0);
  } else {
    console.log(usage);
    process.exit(1);
  }
}
