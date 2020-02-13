# Getting Started

1. [Getting Started](#getting-started)
   1. [Repos](#repos)
   1. [Setup](#setup)
   1. [Node Environment Variables](#node-environment-variables)
      1. [File Structure](#file-structure)
      1. [Variable Definitions](#variable-definitions)
         1. [Magento Generated Values](#magento-generated-values)
   1. [Project Tools](#project-tools)
   1. [Merchant Seeding](#merchant-seeding)
   1. [Versioning](#versioning)
   1. [Updating/Installing the Magento extension](#updatinginstalling-the-magento-extension)
      1. [Normal local development](#normal-local-development)
      1. [Marketplace development](#marketplace-development)
   1. [Uninstalling the Magento extension](#uninstalling-the-magento-extension)
      1. [Marketplace development uninstall](#marketplace-development-uninstall)
   1. [Deleting the Magento extension](#deleting-the-magento-extension)
      1. [Normal local development delete](#normal-local-development-delete)
      1. [Marketplace development delete](#marketplace-development-delete)
      1. [Clear Magento MySql tables](#clear-magento-mysql-tables)
   1. [Releasing Protect to the Magento Marketplace](#releasing-protect-to-the-magento-marketplace)
      1. [Install composer](#install-composer)
      1. [Configure PHP Lint](#configure-php-lint)
         1. [Resources](#resources)
   1. [Troubleshooting](#troubleshooting)
      1. [401 Errors](#401-errors)
      1. [500 Errors](#500-errors)

## Repos

Required repos:

* `ns8-protect-api`
* `ns8-protect-client`
* `ns8-magento-platform`

Repos you may need at some point during development:

* `ns8-protect-sdk`
* `magento2-rest-client`
* `ns8-switchboard-interfaces`
* `ns8-protect-models`
* `ns8-switchboard-operator`

## Setup

* Follow the directions for getting started with the protect-api and protect-client.
  * Start both the protect-api and the protect-client
  * Start ngrok for each. Note the subdomain you select for each, you will need them again soon.
* Follow the directions for configuring your Lightsail instance. You will need to complete the steps to enable SSH access.
  * Note the password you assign to `ec2-user`, you will need it again soon.
  * Note the URL you used to configure Magento, you will need it again soon.
* `$ git clone git@github.com:ns8inc/ns8-magento-platform.git`
  * NOTE: this folder will be referred to as `platform`
* Set the local ENV variables.
  * Copy `platform/.env.schema` -> `platform/.env`
  * Define values for each known environment variable. Some (notably the Magento generated values) you will not have until later in the setup process, but you can leave as `todo` for now. More specific instructions for each variable are documented below. By the end of setup, all `todo` values should be replaced with real values.
* Inside `platform` build the project and deploy it to your Magento instance
  * `$ yarn install`
  * `$ yarn build:dev`
  * `$ yarn module:deploy` (Ensure the region set in switchboard/serverless.yml matches  your AWS configuration [e.g. `us-west-2`] prior to deploying.)
* Deploy `switchboard` from platform
  * `$ yarn deploy --stage={devSuffix}` (e.g. `yarn deploy --stage=crf`)
  * Open AWS -> Steps and confirm your step functions are uploaded
* Install the module on Magento
  * SSH to Magento using your tool of choice. VS Code makes this exceptionally easy with the Remote Explorer extension pack, which is detailed in setup. Ultimately any tool will do.
  * `$ cd var/www/html`
  * `$ ls app/code/NS8/Protect`
    * Confirm the contents have been correctly deployed
  * `$ sudo bin/magento setup:upgrade`
  * Confirm the upgrade succeeds with no errors.
* Open the Magento admin UI, usually at `http://{dev-name}.ns8demos.com/index.php/admin_demo`
  * Navigate to System -> Integrations -> NS8 Protect
  * Click Activate
  * Accept the permissions
  * Confirm the integration successfully activates
    * You should see traffic to your ngrok for protect-api that indicates the success of the API calls
  * Collect the Magento generated values in the Integration Info section, visible through the view info icon.
* Open the protect-api project to create your Magento merchant seed
  * Open `src\migrations\run\32472162000000-seedMerchantsForNs8LocalDev.ts`
  * Copy-paste a seed example from another Magento developer (anything where `type: IntegrationPlatformType.MAGENTO`.
  * Update the service integration values with your Magento generated values from above. See the Environment Variables section for details on mapping.
  * Generate a permanent True Stats token. See @Tokap for help if needed.
  * Restart the protect-api to recompile
  * Your new merchant seed should now be activated
* Confirm Setup Success
  * In the Magento Admin UI, navigate to Sales -> NS8 -> Dashboard
  * Confirm the Client UI renders without error

## Node Environment Variables

A number of environment variables are required in order to maximize the configurability of the dev environment. This section details the use of the variables defined in `.env` which are loaded through `dotenv-extended` and then assigned to the `process.env` in the running node context.

### File Structure

* `.env` is the primary definition of variables. This file is not tracked in VCS and is local to every development environment.
* `.env.defaults` defines any default value to be used if `.env` does not specify a value.
* `.env.schema` defines the known variable names. All variables present in `.env.defaults` and `.env` should be present in the schema.

### Variable Definitions

* `ACCESS_TOKEN_SECRET`: Magento generated value. Corresponds to `protect.service_integration.secret` column.
* `ACCESS_TOKEN`: Magento generated value. Corresponds to `protect.service_integration.token` column.
* `CONSUMER_KEY`: Magento generated value. Corresponds to `protect.service_integration.identity_token` column.
* `CONSUMER_SECRET`: Magento generated value. Corresponds to `protect.service_integration.identity_secret` column.
* `DEV_SUFFIX`: Default value "none". If provided, suffix will be used in semver patch increments. Recommended when testing version changes that need to be published to npm.
* `DEV_EMAIL`: Default value "apps@ns8.com". Sets the platform merchant email for local development. Should be firstname.lastname@ns8.com.
* `MAGENTO_BASE_URL`: The base URL of your magento instance, e.g. `http://{dev-name}.ns8demos.com`.
* `MAGENTO_IP_ADDRESS`: The public IP address of your Magento server to use for SSH connections, e.g. 3.227.191.44.
* `MAGENTO_SSH_PASSWORD`: The password you created when configuring Lightsail for SSH
* `MAGENTO_SSH_USERNAME`: Default value "ec2-user". This rarely needs to be changed unless you have gone out of your way to create other linux users on your Lightsail instance.
* `MAGENTO_URL`: The fully qualified REST API URL, e.g. `http://{dev-name}.ns8demos.com/index.php/rest`
* `NODE_ENV`: Default value "prod". Allowed values: ["prod", "dev"]. Recommend "dev" for local development.
* `NS8_CLIENT_URL`: The base url for your local protect client, e.g. `http://{dev-name}-protect-client.ngrok.io`
* `NS8_PROTECT_URL`: The base url for your local protect api instance, e.g. `http://{dev-name}-protect-api.ngrok.io`

#### Magento Generated Values

The values noted above as Magento Generated can be retrieved from your Admin UI at Admin -> System -> Integrations -> NS8 Protect -> View Details.

![image](https://user-images.githubusercontent.com/722761/67819278-d5265200-fa8a-11e9-83c3-a4c43bd657f7.png)

## Project Tools

The platform has a variety of tools to assist with builds for local development, production, deploying, linting and cleaning the project. This is a list of the platform tooling options, as defined in `package.json`. Unless otherwise noted, all commands are invoked via `$ yarn <command>`.

* `beautify`: Alphabetically sorts all `.json` files. Runs automatically as part of `build`.
* `build:dev`: Explicitly runs `build` in `dev` mode.
* `build:prod`: Explicitly runs `build` in `prod` mode.
* `build`: Base build method. Beautifies, compiles, and runs module config. Uses the `NODE_ENV` variable to decide build method.
* `clean`: Cleans the contents of the platform build folders.
* `compile`: TypeScript compile. Run by `build`.
* `deploy`: Deploys the step functions to AWS. Usage: `$ yarn deploy --stage={devSuffix}`
* `lint`: Runs EsLint on the `switchboard` project.
* `module:build`: Runs composer install on the modules project. This is required to execute `module:lint`.
* `module:config`: Creates the module `config.xml` file according to `.env` variables. Only customizes the file if `NODE_ENV=prod`.
* `module:deploy`: Deploys the `module` folder to Magento instance over SSH
* `module:lint`: Runs the Magento Marketplace PHP lint on the `module` project
* `module:release`: Produces the module ZIP file in accordance with the Magento Marketplace rules for submission.
* `test:debug`: Runs the Mocha unit test suite in debug mode.
* `test`: Runs the Mocha unit test suite.
* `undeploy`: Deletes the step functions from AWS. Usage `$ yarn undeploy --stage={devSuffix}`
* `version:patch`: Automatically increments the version of every project within platform according to semver rules. If `DEV_SUFFIX` is set, will patch version numbers using the dev name.

## Merchant Seeding

Ensuring that you have a valid merchant is a critical step in setting up your development environment, and one that requires some routine maintenance as the seed values can change over time. The relationship between environment variables and the seed definition are described elsewhere, but for additional clarity they are mapped again in this functional example from `src\migrations\run\32472162000000-seedMerchantsForNs8LocalDev.ts` in protect-api:

```ts
    seedStores.push(
      // Christopher: Magento
      new SeedStore({
        trueStatsToken: 'IojfCWyE9OedjSowha4WnOVCVKtXhwPG',
        protectToken: '4691e553-b035-43f4-8f63-6e8276da036d',
        name: 'dev-cfroehlich',
        domain: 'dev-cfroehlich.ns8demos.com',
        timeZone: 'America/New_York',
        status: MerchantStatus.ACTIVE,
        type: IntegrationPlatformType.MAGENTO,
        serviceIntegrations: [
          new SeedServiceIntegration({
            type: ServiceIntegrationType.MAGENTO,
            // CONSUMER_KEY
            identityToken: 'm9aj4z9q6b6z0ss708pvoxch22wkbqse',
            // CONSUMER_SECRET
            identitySecret: 'c1k1l4ayzum511141ylk6w9qfkhtka7h',
            //  ACCESS_TOKEN
            token: 'iv51lxod9qarte5qnj7bcp6ude7g5vir',
            // ACCESS_TOKEN_SECRET
            secret: '13ggoexsjbiqca3nx1j3q5xlk042hng2',
          }),
        ],
        storefrontUrl: 'http://dev-cfroehlich.ns8demos.com',
      }),
    );
```

## Versioning

The platform uses semver sytnax for versioning. When merging with master, the versions should be set to `major.minor.patch` (e.g. `2.0.1`).

When working on feature branches, it is useful to be able to rely on published packages for switches and composer, for performance. To avoid collisions with other developers, use the platform `$ yarn version:patch` command in conjunction with the `DEV_SUFFIX` environment variable to create collision free versions you can safely publish and consume. One use case for this is testing changes to `switchboard`.

Switchboard example workflow:

* Starting version is `2.0.1`
* Set `DEV_SUFFIX=abc`
* Make changes to the `switchboard` project
* `$ yarn version:inc`
* All project versions are now `2.0.2-abc.0`
* Run `npm publish` (DO NOT `yarn publish`--this creates tags)
* `yarn deploy --stage=abc`
* AWS upload completes in approximately a minute

The same process would apply if testing changes to the module project, if you need to also test Marketplace installation. Using the `DEV_SUFFIX`, you will get semver versions that are suitable to use for composer publish and deploy tags.

## Updating/Installing the Magento extension

Depending on whether you are testing the extension in "normal" local environment development or you are testing the Marketplace installation, your steps may vary.

### Normal local development

In most cases, simply run `$ yarn module:deploy` whenever you want to push your local changes to Magento. You already covered the very first deploy in Getting Started. Should Magento not pick up the changes, see the steps in Troubleshooting to attempt to correct. In same (drastic) cases, you may consider deleting the extension and then repeat the initial installation steps from Getting Started.

### Marketplace development

If you are testing the installation of the extension via composer to test installation through the Marketplace, this is how to install/update the extension. If you have ever used the local development steps, you will first need to complete a full Delete of the extension (include the database).

* Until Concourse is fully configured to deploy the magento-module, you will need the following steps
  * Register an account with <https://packagist.org>
    * Ask @crfroehlich or another developer to add you as a maintainer to <https://packagist.org/packages/ns8/protect-magento>
  * `$ git clone git@github.com:ns8inc/ns8-magento-module.git`
  * Create a branch for your work
  * Determine the semver version you will use for testing. See Versioning for more details.
  * Run platform `$ yarn build:dev` to ensure your `config.xml` is tailored to your dev environment
  * Sync the contents of the platform `module` folder into the `ns8-magento-module`. Be sure to account for deleted files.
  * Commit your changes.
  * Create a tag on your recent commit as `v{semverVersion}` (e.g. `v2.0.{n}`)
  * Confirm the new version appears in <https://packagist.org/packages/ns8/protect-magento>
* Install on Magento
  * SSH to your magento server at `var/www/html`
  * `$ sudo rm -rf vendor/`
  * Delete `composer.lock`
  * Edit `composer.json`
    * Add `ns8/protect-magento` to the `require` block with your new version
  * `$ composer install`
  * `$ sudo bin/magento setup:upgrade`
  * `$ sudo bin/magento cache:clean`
  * `$ sudo bin/magento cache:enable`
  * `$ sudo bin/magento module:status`
  * Confirm that NS8 Protect is listed
* Verify `.htaccess` Environment Variables
  * Confirm that `NS8_CLIENT_URL` and `NS8_PROTECT_URL` are still set.
* Activate the NS8 Protect Integration in Magento Admin

## Uninstalling the Magento extension

If you are testing Marketplace development, the uninstall process is what customers will trigger when they uninstall the Protect extension from the Admin UI. This process only relates to Marketplace development. For local development, see Deleting.

### Marketplace development uninstall

If you are testing the installation of the extension via composer to test installation through the Marketplace, this is how to uninstall the extension via the command line:

* SSH to your magento server at `var/www/html`
* `$ sudo bin/magento module:status`
* Confirm that NS8 Protect is listed as enabled
* `$ sudo bin/magento module:uninstall NS8_Protect`
  * Confirm `y` to delete existing data
* `$ sudo bin/magento module:status`
* Confirm that NS8 Protect no longer listed
* Refresh the Admin UI to confirm that Protect does not appear anywhere

## Deleting the Magento extension

Frequently over the course of Magento development, you will need to delete the existing NS8 Protect extension from Magento and re-install. **NOTE** Delete is fundamentally different from Uninstall, as delete is a way to forcibly remove the extension, bypassing all Magento platform logic that would normally be triggered as part of the uninstall. If you are working in normal local development, however, delete is the appropriate approach.

Depending on whether you are testing the extension in "normal" local environment development or you are testing the Marketplace installation, your steps may vary.

### Normal local development delete

If you are using the standard development flow, this is how to delete the extension.

* SSH to your magento server at `var/www/html`
* `$ sudo rm -rf app/code/NS8/Protect/`
* `$ sudo bin/magento setup:upgrade`
* `$ sudo bin/magento cache:clean`
* `$ sudo bin/magento cache:enable`
* `$ sudo bin/magento module:status`
* Confirm that NS8 Protect is no longer listed

### Marketplace development delete

If you are testing the installation of the extension via composer to test installation through the Marketplace, this is how to delete the extension.

* SSH to your magento server at `var/www/html`
* `$ sudo rm -rf vendor/`
* `$ rm composer.lock`
* Edit `composer.json`
  * Remove `ns8/protect` from the `require` block
* `$ composer install`
* `$ sudo bin/magento setup:upgrade`
* `$ sudo bin/magento cache:clean`
* `$ sudo bin/magento cache:enable`
* `$ sudo bin/magento module:status`
* Confirm that NS8 Protect is no longer listed

### Clear Magento MySql tables

Sometimes if you make a core change that requires an explicit version increase, you may need to manually purge the Magento tables in order to guarantee a clean install. This step is optional. Use it only if you're absolutely sure you need to do this. **NOTE**: Doing this will reset _all_ of your Magento generated values from the Protect Integration. You will need to update your protect-api seed file with new values after you complete installation.

* SSH to your magento server
* `$ mysql -u magento_db_user -pmagento_db_password magento2`
* `mysql> delete from setup_module where module like '%ns8%';`
* `mysql> delete from integration where name like '%ns8%';`
* `mysql> exit`

## Releasing Protect to the Magento Marketplace

In platform:

* `$ yarn lint:php` and verify there are no errors.
* `$ yarn module:release` to generate the ZIP file
* Upload to the Marketplace
  * Many TBD items to be placed here

### Install composer

```bash
$ cd ~
sudo curl -sS https://getcomposer.org/installer | sudo php
sudo mv composer.phar /usr/local/bin/composer
sudo ln -s /usr/local/bin/composer /usr/bin/composer
```

### Configure PHP Lint

To get your local development environment configured to quality test for submission, follow these steps. These steps are in addition to the [Magento Coding Standard steps](https://github.com/magento/magento-coding-standard)

* Install PHP
  * Enable `mbstring` extension
* Install `Composer`:
* Install `simple-xml`
* Run lint: `$ phpcs --standard=Magento2 --ignore=*/vendor/* ./module`
* Auto-fix errors: `$ phpcbf --standard=Magento2 --ignore=*/vendor/* ./module`

#### Resources

* <https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage#ignoring-files-and-folders>
* <https://linuxize.com/post/how-to-install-and-use-composer-on-ubuntu-18-04>
* <https://www.php.net/manual/en/simplexml.installation.php>
* <https://stackoverflow.com/questions/31690561/composer-error-while-installing-laravel-mbstring-is-missing> for help
* <https://magento.stackexchange.com/questions/111085/how-to-fix-warnings-errors-raised-by-the-magento-marketplace-technical-review>

## Troubleshooting

General steps when Magento fails to load

* SSH to Magento
* Open `var/www/html`
  * `$ sudo bin/magento setup:upgrade`
  * `$ sudo bin/magento setup:static-content:deploy`
  * `$ sudo bin/magento cache:clean`
  * `$ sudo bin/magento cache:enable`
  * `$ sudo bin/magento setup:di:compile`
* If Protect fails to load after these steps, consider the steps to Delete the extension.

Ensure you have the latest code from all repositories. NOTE: if you are using `yarn link`, this list could be quite extensive. The following repos (if used) should be checked. If they are not present, you do not need to clone them.

* `ns8-protect-api`
* `ns8-protect-client`
* `ns8-protect-sdk`
* `ns8-magento-platform`
* `magent2-rest-client`
* `ns8-switchboard-interfaces`
* `ns8-protect-models`
* `ns8-switchboard-operator`

### 401 Errors

In some cases, the process of troubleshooting, installing/deleting/re-installing/updating can have the side effect of losing your environment variables.

* SSH to Magento at `var/www/html`
* Assert that `.htaccess` has values for `NS8_CLIENT_URL` and `NS8_PROTECT_URL`
* If not, create the values according to your environment variables:
  * `echo "SetEnv NS8_CLIENT_URL {NS8_CLIENT_URL}" | sudo tee -a /var/www/html/.htaccess`
  * `echo "SetEnv NS8_PROTECT_URL {NS8_PROTECT_URL}" | sudo tee -a /var/www/html/.htaccess`

### 500 Errors

Two main causes of 500 errors are expired credentials and schema changes.

* Credentials
  * Confirm the protect.service_integration tokens and secrets match the Integration details from Magento admin
  * Confirm your protect.merchant record is set to Active
  * Confirm your True Stats token is not expired
* Schema
  * In protect-api, run the scripts to stop the dynamo db container, start it again, then create the tables.
  * Verify your merchant seed file is up to date with the Magento Integration details and reset your protect schema
