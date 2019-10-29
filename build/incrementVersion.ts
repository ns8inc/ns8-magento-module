import composer from '../module/composer.json';
import rootPackage from '../package.json';
import semver, { ReleaseType } from 'semver';
import switchboardPackage from '../switchboard/package.json';
import switchesPackage from '../switches/package.json';
import { env } from './loadEnv';
import { writeFileSync } from 'fs';

const getModuleXml = (nextVersion: string): string => `
<?xml version="1.0" ?>
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
 * If `DEV_SUFFIX` defined on the env, we can incrementally patch by suffix
 * e.g. `2.0.1` would increment to `2.0.2-abc.0`
 * `2.0.2-abc.0` would increment to `2.0.2-abc.1`
 */
const incrementVersion = () => {
  let devSuffix: string | undefined;
  let releaseType: ReleaseType = 'patch';

  if (process.env.DEV_SUFFIX && process.env.DEV_SUFFIX.trim().toLocaleLowerCase() != 'none') {
    devSuffix = process.env.DEV_SUFFIX;
    releaseType = 'prerelease';
  }

  const currentVersion: string = rootPackage.version;
  const nextVersion: string | null = semver.inc(currentVersion, releaseType, false, devSuffix);

  if (!nextVersion) throw new Error('Could not increment version');

  rootPackage.version = nextVersion;
  writeFileSync('package.json', JSON.stringify(rootPackage, null, 2));
  console.log(`Updated project ${currentVersion} to ${nextVersion}`);

  writeFileSync('module/etc/module.xml', getModuleXml(nextVersion));
  console.log(`Updated module xml ${currentVersion} to ${nextVersion}`);

  composer.version = nextVersion;
  writeFileSync('module/composer.json', JSON.stringify(composer, null, 2));
  console.log(`Updated composer ${currentVersion} to ${nextVersion}`);

  switchboardPackage.dependencies['@ns8/ns8-magento2-switches'] = nextVersion;
  switchboardPackage.version = nextVersion;
  writeFileSync('switchboard/package.json', JSON.stringify(switchboardPackage, null, 2));
  console.log(`Updated switchboard ${currentVersion} to ${nextVersion}`);

  switchesPackage.version = nextVersion;
  writeFileSync('switches/package.json', JSON.stringify(switchesPackage, null, 2));
  console.log(`Updated switches ${currentVersion} to ${nextVersion}`);
};

try {
  incrementVersion();
} catch (error) {
  console.error(error);
  console.info(env);
}