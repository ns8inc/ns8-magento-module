/* eslint-disable no-console */
import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 *
 * @returns {Promise<string | null>} - The latest semver version string for magento2, or null if the response
 * is not a 200-level code.
 *
 */

async function getLatestVersion(): Promise<string | null> {
  const magentoTagsUrl = 'https://api.github.com/repos/magento/magento2/tags';

  try {
    const response = await fetch(magentoTagsUrl);

    if (!response.status.toString().startsWith('2')) {
      console.log(`Failed to fetch latest Magento version from the magento2 github url [ ${magentoTagsUrl} ].`);
      console.log(`Github API Response: ${response.statusText}`);
      return null;
    }

    const [latest] = await response.json();
    return latest.name;
  } catch (e) {
    throw new Error(`Fetching latest Magento tags from ${magentoTagsUrl} failed. More information: ${e}.`);
  }
}

/**
 * Sets the MAGENTO='version' filepaths to the specified Magento version. If the file in question
 * is missing a 'MAGENTO_VERSION=' bash variable declaration, it logs a message and skips that file.
 *
 * @param {string} newVersion - The new version to set in {@link filepaths}.
 * @param {string[]} filepaths - an array of filepaths to update.
 *
 */

async function setFilesToTargetVersion(newVersion: string, filepaths: string[]): Promise<void> {
  filepaths.forEach((filepath) => {
    let scriptContent;

    try {
      scriptContent = readFileSync(filepath, 'utf8');
    } catch (e) {
      console.log(`Failed to read file: ${filepath}.`);
      throw new Error(e);
    }

    // If there is no version declaration at all, dev will need to add it manually
    const variableDeclarationExists = /MAGENTO_VERSION=/.test(scriptContent);
    if (!variableDeclarationExists) {
      console.log(`Warning: no variable declaration exists in file: ${filepath}. Skipping ...`);
      return;
    }

    // grab the version number
    const match = /MAGENTO_VERSION=(.*)/.exec(scriptContent) || [];
    const previousVersion = match[1];

    // keep variable declaration, but replace the version number.  this removes comments after version number.
    const scriptWithNewVersionNumber = scriptContent.replace(/(MAGENTO_VERSION=).*/, `$1${newVersion}`);
    const versionAfterUpdate = (/MAGENTO_VERSION=(.*)/.exec(scriptWithNewVersionNumber) || [])[1];

    console.log(`\nUpdating file: ${filepath}...`);
    if (previousVersion) {
      console.log(`- Previous magento version was: ${previousVersion}.`);
    }
    console.log(`- Magento version is now: ${versionAfterUpdate}.\n`);

    try {
      writeFileSync(filepath, scriptWithNewVersionNumber);
    } catch (e) {
      console.log(`Failed to write new Magento version to ${filepath}.`);
      throw new Error(e);
    }
  });
}

/**
 *
 * Calls {@link setFilesToTargetVersion} on a list of filepaths with a Magento version string.
 *
 * @param {string} newVersion - The new version to set in {@link filepaths}.
 * @param {string[]} filepaths - an array of filepaths to update.
 *
 */
export default async function setMagentoVersion(version: string, filepaths: string[]): Promise<void> {
  const targetVersion = version === 'latest' ? String(await getLatestVersion()) : version;
  setFilesToTargetVersion(targetVersion, filepaths);
}

if (__filename === process.mainModule?.filename) {
  const args = process.argv.slice(2);
  const [flag, version] = args;
  const usage = `
    usage: setMagentoVersion -v <semver string>
    e.g. setMagentoVersion -v 2.4.3`;

  if (flag === '-v' && (version || '').length > 0) {
    const filepaths = [join(__dirname, '../scripts/lightsail-setup.sh'), join(__dirname, '../scripts/testbox')];
    setMagentoVersion(version, filepaths);
  } else if (flag === '-h') {
    console.log(usage);
    process.exit(0);
  } else {
    console.log(usage);
    process.exit(1);
  }
}
