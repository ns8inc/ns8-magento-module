/* eslint-disable no-console, import/extensions */
import semver, { ReleaseType } from 'semver';
import { writeFileSync } from 'fs';
import composer from '../module/composer.json';
import rootPackage from '../package.json';
import switchboardPackage from '../switchboard/package.json';
import switchboardJson from '../switchboard/switchboard.json';
import switchesPackage from '../switches/package.json';
import { env } from './loadEnv';

const getModuleXml = (nextVersion: string): string => `<?xml version="1.0" ?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
  <module name="NS8_Protect"
    setup_version="${nextVersion}">
    <sequence>
      <module name="NS8 Protect" />
    </sequence>
  </module>
</config>
`;

/**
 * Increments all of the project's version numbers according to semver patch rules.
 * If `DEV_SUFFIX` defined on the env and if the `PATCH_MODE` is "dev", we can incrementally patch by suffix
 * e.g. `2.0.1` would increment to `2.0.2-abc.0`
 * `2.0.2-abc.0` would increment to `2.0.2-abc.1`
 */
const incrementVersion = (): void => {
  const devSuffix: string = process.env.DEV_SUFFIX
    ? process.env.DEV_SUFFIX.trim().toLowerCase()
    : 'none';
  const patchMode: string = process.env.PATCH_MODE
    ? process.env.PATCH_MODE.trim().toLowerCase()
    : 'patch';
  const releaseType: ReleaseType =
    devSuffix !== 'none' && patchMode === 'dev' ? 'prerelease' : 'patch';
  const currentVersion: string = rootPackage.version;
  const nextPackageVersion: string | null = semver.inc(
    currentVersion,
    releaseType,
    false,
    devSuffix
  );
  if (!nextPackageVersion)
    throw new Error('Could not increment package version');
  // This is a temporary workaround for working with prerelease versions in order to comply with the Magento version standards
  const nextMagentoVersion: string | null = semver.inc(
    currentVersion,
    'patch',
    false
  );
  if (!nextMagentoVersion)
    throw new Error('Could not increment magento version');

  rootPackage.version = nextPackageVersion;
  writeFileSync('package.json', JSON.stringify(rootPackage, null, 2));
  console.log(`Updated project ${currentVersion} to ${nextPackageVersion}`);

  writeFileSync('module/etc/module.xml', getModuleXml(nextMagentoVersion));
  console.log(`Updated module xml ${currentVersion} to ${nextMagentoVersion}`);

  composer.version = nextPackageVersion;
  writeFileSync('module/composer.json', JSON.stringify(composer, null, 2));
  console.log(`Updated composer ${currentVersion} to ${nextPackageVersion}`);

  switchboardPackage.dependencies[
    '@ns8/ns8-magento2-switches'
  ] = nextPackageVersion;
  switchboardPackage.version = nextPackageVersion;
  writeFileSync(
    'switchboard/package.json',
    JSON.stringify(switchboardPackage, null, 2)
  );
  console.log(`Updated switchboard ${currentVersion} to ${nextPackageVersion}`);

  switchboardJson.modules[0].version = nextPackageVersion;
  writeFileSync(
    'switchboard/switchboard.json',
    JSON.stringify(switchboardJson, null, 2)
  );
  console.log(
    `Updated switchboard JSON ${currentVersion} to ${nextPackageVersion}`
  );

  switchesPackage.version = nextPackageVersion;
  writeFileSync(
    'switches/package.json',
    JSON.stringify(switchesPackage, null, 2)
  );
  console.log(`Updated switches ${currentVersion} to ${nextPackageVersion}`);
};

try {
  incrementVersion();
} catch (error) {
  console.error(error);
  console.info(env);
}
