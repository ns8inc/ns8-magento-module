# Magento Specific Concerns

1. [Magento Specific Concerns](#magento-specific-concerns)
   1. [Authentication and authorization](#authentication-and-authorization)
      1. [Magento Oauth](#magento-oauth)
      1. [Benefits of oauth](#benefits-of-oauth)
      1. [Limitations of oauth flow](#limitations-of-oauth-flow)
      1. [Conclusion](#conclusion)
      1. [Useful links](#useful-links)
   1. [Platform Quirks and General Notes](#platform-quirks-and-general-notes)
      1. [Order State vs. Order Status](#order-state-vs-order-status)
      1. [Hold & Unhold](#hold--unhold)
      1. [Install / Uninstall](#install--uninstall)
      1. [Unique Identifier On Install](#unique-identifier-on-install)
      1. [Using the Magento DB](#using-the-magento-db)
      1. [Benefits of Internal Storage](#benefits-of-internal-storage)
      1. [Drawbacks of Internal Storage](#drawbacks-of-internal-storage)
      1. [A Warning About Outbound PHP Calls](#a-warning-about-outbound-php-calls)
      1. [Blocking Calls](#blocking-calls)
   1. [Unit Tests](#unit-tests)
      1. [Conventions](#conventions)
      1. [Environment](#environment)
      1. [Executing](#executing)
   1. [User Interface Design](#user-interface-design)
      1. [Passing data to NS8 Protect](#passing-data-to-ns8-protect)
      1. [Passing data back to Magento](#passing-data-back-to-magento)
   1. [Modules and Extensions](#modules-and-extensions)
      1. [Module Lifecycle](#module-lifecycle)
      1. [Install vs Upgrade](#install-vs-upgrade)
      1. [Trigger Module Install](#trigger-module-install)
      1. [Trigger Module Upgrade](#trigger-module-upgrade)
   1. [Views](#views)
      1. [Pitfalls](#pitfalls)
   1. [Magento Marketplace Standards](#magento-marketplace-standards)
      1. [PHP Standards](#php-standards)
   1. [Resources](#resources)
      1. [API](#api)
      1. [Orders](#orders)
      1. [Unit tests](#unit-tests-1)
      1. [Linting](#linting)
      1. [Logging](#logging)
      1. [General](#general)
      1. [Web API](#web-api)
      1. [Component Development](#component-development)

This is the landing page for all platform specific knowledge and insights into the Magento platform and framework

## Authentication and authorization

The challenges that need to be addressed for auth around Magento modules are:

1. Authentication upon first install, can we enforce that install request is coming from a real Magento instance.
1. Provide mechanism to validate API requests from Magento module to NS8 switches
1. Provide mechanism to call from NS8 switches back to Magento instance

### Magento Oauth

Magento provides a workflow that allows for a module to register an integration which, when activated, initiates an oauth1 flow that results in the backend service storing an accessToken and accessTokenSecret. These tokens can then be used to sign requests to call back to the Magento instance.

### Benefits of oauth

The oauth flow has the benefit of being a built in mechanism. Once we have the tokens stored we will have a robust method for handling calls to Magento. Since we have these tokens stored in Magento as well as NS8 we can also use these tokens to sign requests from Magento back to NS8. So this flow is a viable answer for #2 and #3 above.

### Limitations of oauth flow

For challenge #1 above the oauth flow provides limited ability to validate a request is coming from a real Magento instance. Since Magento can be installed anywhere, the first request we get from a new install could come from anywhere. By locking the initial install behind the oauth flow for initial activation we provide some obfuscation, but a dedicated attacker could easily simulate the Magento side of the oauth flow and we would not be able to differentiate.

### Conclusion

Magento's built in oauth gives us the tools we need to call between systems. It provides limited authentication on the first call we get from a new user. The nature of platforms like Magento means that they can be installed in any way. It becomes difficult to differentiate between a Magento instance and any other system. We will likely need to think about monitoring calls from Magento merchants to identify any unusual call patterns that might indicate malicious intent.

### Useful links

* [Oauth Based Authentication](https://devdocs.magento.com/guides/v2.3/get-started/authentication/gs-authentication-oauth.html)
* [Create an Integration](https://devdocs.magento.com/guides/v2.3/get-started/create-integration.html)
* [POC Oauth Endpoints]( https://github.com/ns8inc/ns8-protect-api/tree/magento_oauth_flow)

## Platform Quirks and General Notes

### Order State vs. Order Status

**Order State** refers to a set of predefined states that an order may exist in. This is what we would normally consider an order status if speaking in terms of Shopify or NS8 Protect. The current default state list is:

* Canceled
* Closed
* Complete
* Payment Review
* Processing
* On Hold
* Pending
* Pending Payment

**Order Status** refers to a set of labels which can be customized. These labels must directly correspond to a specific `Order State`. We are capable of registering our own custom order statuses.

### Hold & Unhold

Putting an order on `hold` supersedes the existing order state and prevents further movement through the flow. Once removed, it is believed that the order is put back into the prior state. This behavior should be confirmed if we plan to rely on it in any way.

From our perspective, the Switch that handles changing the `Order State` should check for a hold (assuming that information is available).

### Install / Uninstall

Install and Uninstall actions in V1 simply set the account to a status of "cancelled" using the V1 system. There were a number of scenarios where the behavior worked correctly. Starting from an installed state, these acceptable behaviors were:

* Uninstall & reinstall
* Delete app manually & reinstall

The bad scenario would be:

* Removing the entire Magento instance or clearing the data store holding the NS8 Protect `projectId` & `accessToken` that were stashed on the Magento instance.

Thus, we need a good way to determine if the instance of Magento that is contacting us is a known one. This leads into the topic of unique identifiers discussed further in the next section.

### Unique Identifier On Install

There isn't one. The V1 system generates a unique username for the store on install. This makes it incredibly hard to recognize a reinstall if someone has completely nuked their instance identifiers and reinstalled the application.

The new onboarding flow requires the user to input and validate their email. This should provide us an avenue to confirm and communicate with that individual. Part of the process can be an automated retrieval flow if such a system is needed. We can also add a manual workaround advising individuals to contact sales if we see they have previously installed the application - by matching on their email - and left themselves in a broken/impossible state.

We will have to consider how to leverage this information and build a system that operates within its constraints.

> Note: We should avoid using the email or the shop domain as the username. It is apparently a common scenario that a single individual manages multiple Magento shops or will have a few running off of the same domain. Because self-hosted platforms are so customizable, there are many pitfalls to avoid. But in short, email gives us a great avenue to connect with the merchant, but should not be used as a unique identifier.

### Using the Magento DB

Magento provides a method of inserting NS8 Protect data into their order review table. There are some benefits to storing the data with the Magento instance and some pitfalls as well.

### Benefits of Internal Storage

* Protect data is treated as first class Magento data - can be filtered upon, exported, etc.

### Drawbacks of Internal Storage

* Keeping data in sync with NS8 Protect's DB can be difficult

When trying to keep in sync with Protect's DB, there are multiple issues that can come up. One such issue is discussed in the next section.

### A Warning About Outbound PHP Calls

Allegedly the issue described below was resolved in later PHP versions. We should confirm which version is the cut off for the behavior so we can assert a reliable support range. Alternatively, we have to update our code to account for the following.

### Blocking Calls

In the architect's experience, we are capable of downing an entire Magento instance if certain calls fail to execute and hang. The most likely reason for an event such as this would be a sudden glitch in processing or a severe server slowdown. In scenarios where the architect was processing events in V1 and sending outbound calls, he stated that short timeouts were used to ensure the calls could never hang long enough to down the entire instance.

## Unit Tests

There is a limited subset of things that can be tested under the Magento framework directly; but if we can write tests--we should. These unit tests will almost exclusively be executed by developers, as they do not lend themselves to integration with CircleCi or other platforms.

### Conventions

Magento has strict naming and structural conventions that must be followed if tests are to execute automatically.

* Test file names must end with "Test", e.g. `ConfigTest.php`.
* Tests must live under `Test/Unit`.
* Test classes must extend `\PHPUnit\Framework\TestCase`
* Test methods must begin with "test", e.g. `public function testTest()`.

### Environment

* Verify that Magento is setup for unit tests
  * `$ composer show magento/magento2-functional-testing-framework`
    * If composer is not found, you may need to install it.
    * `$ curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer`

### Executing

Unit tests can be executed in Magento by running `$ php bin/magento dev:tests:run unit`. This will execute *all* unit tests defined in `/var/www/html/dev/tests/unit/phpunit.xml.dist`. To reduced the number of unit tests that are executed, edit the `phpunit.xml.dist` file to include only tests from `<directory suffix="Test.php">../../../app/code/*/*/Test/Unit</directory>`.

## User Interface Design

The NS8 Protect Settings UI will be housed in an iframe within the Magento admin interface.

### Passing data to NS8 Protect

The iframe in the Magento interface will pass data to the NS8 Protect app via query parameters. The following params need to be passed:

* ?? Please fill in documentation here

### Passing data back to Magento

The NS8 app will pass data back to Magento after processes have completed via specific API calls (documented at *LINK*).

## Modules and Extensions

### Module Lifecycle

All modules have the idea of schema versions and data versions. To make changes to the module data/schema you need to implement one of the lifecycle hooks by creating/modifying files in the `Setup` directory. The most important implementations would be `InstallData`, `UpgradeData`, `InstallSchema`, `UpgradeSchema`.

### Install vs Upgrade

Install lifecycle events are run only when the module is first installed. Any subsequent changes to this code will be ignored by Magento under normal circumstances. Upgrade events are run whenever Magento detects a new version of the module has been loaded. In both cases special steps need to be taken to ensure changed code is run.

### Trigger Module Install

1. Implement `Install[Data/Schema]` in the Setup directory that implements `Install[Data/Schema]Interface` as well as the install function.
1. Deploy new code to Magento
1. If this module has been installed to this Magento instance already you need to force Magento to treat it as a new install. Log into the MySQL instance (`$ mysql -u magento_db_user -p magento2`), and remove the record for this module from the `setup_module` table: `$ delete from setup_module where module like '%ns8%';` and `$ delete from integration where name like '%ns8%';`
1. Run `$ bin/magento setup:upgrade`

### Trigger Module Upgrade

1. Update `Upgrade[Data/Schema]` in the Setup directory that implements `Upgrade[Data/Schema]Interface` as well as the upgrade function.
1. In `etc/module.xml` find the `setup_version` attribute and increase it to a higher version (eg 1.0.0 -> 1.0.1)
1. Deploy new code to Magento
1. Run `bin/magento setup:upgrade`
1. Changes should run, you can also verify version by querying for the module in the `setup_module` table that has schema/data versions.

## Views

### Pitfalls

* Magento reads the PHP DocBlocks of some files to determine what objects to pass them as parameters. If you see an error like `Type Error occurred when creating object: NS8\Protect\Controller\Adminhtml\Settings\Index\Interceptor`, go double-check that your constructor signature matches its DocBlocks.

## Magento Marketplace Standards

### PHP Standards

The platform extension must conform to Magento's marketplace rules. To get your local development environment configured to quality test for submission, follow these steps. These steps are in addition to the [Magento Coding Standard steps](https://github.com/magento/magento-coding-standard)

* Install PHP
  * Enable `mbstring` extension
* Install `Composer`:
* Install `simple-xml`
* Run lint: `$ phpcs --standard=Magento2 --ignore=*/vendor/* ./module`
* Auto-fix errors: `$ phpcbf --standard=Magento2 --ignore=*/vendor/* ./module`

## Resources

### API

* <https://magento.stackexchange.com/questions/195612/getting-data-from-external-webservice>
* <https://devdocs.magento.com/guides/v2.3/get-started/gs-web-api-request.html>
* <https://hotexamples.com/examples/-/Zend%255CHttp%255CClient/-/php-zend%255chttp%255cclient-class-examples.html>
* <https://mage2.pro/t/topic/485>
* <https://stackoverflow.com/questions/25538440/using-zend-http-client-to-send-json-post>
* <https://magento.stackexchange.com/questions/253414/magento-2-3-upgrade-breaks-http-post-requests-to-custom-module-endpoint>
* <https://stackoverflow.com/questions/13066687/send-request-after-checkout-process-in-magento>
* <https://devdocs.magento.com/guides/v2.3/rest/generate-local.html>
* <https://devdocs.magento.com/guides/v2.3/extension-dev-guide/service-contracts/service-to-web-service.html>

### Orders

* <https://magento.stackexchange.com/questions/154838/magento-2-how-to-get-order-data-in-observer-on-success-page>
* <https://www.cloudways.com/blog/magento-2-events-observers>
* <https://devdocs.magento.com/guides/v2.3/extension-dev-guide/events-and-observers.html>
* <https://www.mageplaza.com/magento-2-module-development/magento-2-events.html>

### Unit tests

* <https://www.codementor.io/pekebyte/how-to-write-magento-2-unit-tests-under-a-custom-module-mml63lrpj>
* <https://www.mageplaza.com/devdocs/magento-2-unit-test/>
* <https://www.mageplaza.com/devdocs/magento-2-run-tests.html>
* <https://devdocs.magento.com/mftf/docs/introduction.html>
* <https://devdocs.magento.com/guides/v2.3/get-started/web-api-functional-testing.html>
* <https://magento.stackexchange.com/questions/263471/magento-2-3-write-unit-test-for-observer>
* <https://www.mageplaza.com/devdocs/magento-2-command-line-interface-cli.html>

### Linting

* <https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage#ignoring-files-and-folders>
* <https://linuxize.com/post/how-to-install-and-use-composer-on-ubuntu-18-04>
* <https://www.php.net/manual/en/simplexml.installation.php>
* <https://stackoverflow.com/questions/31690561/composer-error-while-installing-laravel-mbstring-is-missing>
* <https://devdocs.magento.com/guides/v2.3/coding-standards/docblock-standard-general.html>

### Logging

* <https://www.mageplaza.com/devdocs/how-write-log-magento-2.html>

### General

* <https://www.mageplaza.com/magento-2-module-development/>
* <https://www.mageplaza.com/kb/how-flush-enable-disable-cache.html>

### Web API

* <https://inchoo.net/magento-2/magento-2-custom-api/>
* <https://webkul.com/blog/magento2-custom-rest-api/>
* <https://devdocs.magento.com/guides/v2.3/extension-dev-guide/service-contracts/service-to-web-service.html>
* <https://devdocs.magento.com/guides/v2.3/rest/list.html>
* <https://devdocs.magento.com/redoc/2.3/admin-rest-api.html>

### Component Development

* <https://devdocs.magento.com/guides/v2.3/extension-dev-guide/build/create_component.html>
* <https://devdocs.magento.com/guides/v2.3/extension-dev-guide/build/composer-integration.html>
