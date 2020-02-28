/* eslint-disable no-console */
import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { compare as compareVersion, valid as validVersion } from 'semver';

/**
 *
 * @returns {Promise<string | null>} - The latest semver version string for magento2, or null if the response
 * is not a 200-level code.
 *
 */

const exitWithErrorMessage = (msg:string): void => {
  console.log(msg);
  process.exit(1);
}

/**
 * 
 * @param {string} newVersion - The new version to set in {@link filepaths}.
 * @returns {string[]} - a list of valid semver version strings.
 *
 */

async function getVersions(): Promise<string[] > {
  const magentoTagsUrl = 'https://api.github.com/repos/magento/magento2/tags';

  try {
    const response = await fetch(magentoTagsUrl);

    if (!response.status.toString().startsWith('2')) {
      console.log(`Failed to fetch latest Magento version from the magento2 github url [ ${magentoTagsUrl} ].`);
      console.log(`Github API Response: ${response.statusText}`);
      return [];
    }

    const versions = await response.json();
    return versions.map(version => version.name);
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
  const updatedScripts: string[] = [];

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

    updatedScripts.push(filepath);
  });

  updatedScripts.forEach((file) => {
    console.log(`WARNING: updated script ${file}. Make sure not to unintentionally commit this file to github`);
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

export default async function setMagentoVersion(updateVersion: string, filepaths: string[]): Promise<void> {
  if (!validVersion(updateVersion)) {
    exitWithErrorMessage(`\nERROR: invalid version supplied: ${updateVersion}\n`);
  }

  const versions = (await getVersions());
  const latestVersion = versions[0];
  const foundVersion = versions.find(version => updateVersion === version);

  if (!foundVersion) {

    const list = versions.map(v => `- ${v}\n`).join('');
    exitWithErrorMessage(`\nERROR: supplied version (${updateVersion}) is not in the list of available versions: \n${list}`);

  }


  if (!validVersion(latestVersion)) {
    exitWithErrorMessage(`\nERROR: Magento version fetched from Github is invalid: ${updateVersion}\n`);
  }

  const userVersionTooHigh = compareVersion(updateVersion, latestVersion) > 0;

  if (userVersionTooHigh) {
    exitWithErrorMessage(
      `\nERROR: The version you have supplied (${updateVersion}) is beyond the latest Magento release (${latestVersion}).\n`,
    );
  }

  const targetVersion = updateVersion === 'latest' ? latestVersion : updateVersion;
  setFilesToTargetVersion(targetVersion, filepaths);
}

if (__filename === process.mainModule?.filename) {
  const args = process.argv.slice(2);
  const [flag, version] = args;
  const usage = `
    usage: setMagentoVersion [-v <semver string>] [-l]
    -v, set scripts to <semver version>
    -l, get latest magento version
  `;

  if (flag === '-v' && (version || '').length > 0) {
    const filepaths = [join(__dirname, '../scripts/lightsail-setup.sh'), join(__dirname, '../scripts/testbox')];
    setMagentoVersion(version, filepaths).catch((e) => {
      throw e;
    });
  } else if (flag === '-h') {
    console.log(usage);
    process.exit(0);
  } else {
    exitWithErrorMessage(usage);
  }
}
