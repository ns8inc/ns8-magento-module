This is the landing page for all platform specific knowledge and insights into the Magento platform and framework

# Authentication and authorization

The challenges that need to be addressed for auth around Magento modules are:
1. Authentication upon first install, can we enforce that install request is coming from a real Magento instance.
2. Provide mechanism to validate API requests from Magento module to NS8 switches
3. Provide mechanism to call from NS8 switches back to Magento instance

## Magento Oauth
Magento provides a workflow that allows for a module to register an integration which, when activated, initiates an oauth1 flow that results in the backend service storing an accessToken and accessTokenSecret. These tokens can then be used to sign requests to call back to the Magento instance.

### Benefits of oauth
The oauth flow has the benefit of being a built in mechanism. Once we have the tokens stored we will have a robust method for handling calls to Magento. Since we have these tokens stored in Magento as well as NS8 we can also use these tokens to sign requests from Magento back to NS8. So this flow is a viable answer for #2 and #3 above.

### Limitations of oauth flow
For challenge #1 above the oauth flow provides limited ability to validate a request is coming from a real Magento instance. Since Magento can be installed anywhere, the first request we get from a new install could come from anywhere. By locking the initial install behind the oauth flow for initial activation we provide some obfuscation, but a dedicated attacker could easily simulate the Magento side of the oauth flow and we would not be able to differentiate.

## Conclusion
Magento's built in oauth gives us the tools we need to call between systems. It provides limited authentication on the first call we get from a new user. The nature of platforms like Magento means that they can be installed in any way. It becomes difficult to differentiate between a Magento instance and any other system. We will likely need to think about monitoring calls from Magento merchants to identify any unusual call patterns that might indicate malicious intent.

## Useful links
[Oauth Based Authentication](https://devdocs.magento.com/guides/v2.3/get-started/authentication/gs-authentication-oauth.html)

[Create an Integration](https://devdocs.magento.com/guides/v2.3/get-started/create-integration.html)

[POC Oauth Endpoints]( https://github.com/ns8inc/ns8-protect-api/tree/magento_oauth_flow)

# Unit Tests

There is a limited subset of things that can be tested under the Magento framework directly; but if we can write tests--we should. These unit tests will almost exclusively be executed by developers, as they do not lend themselves to integration with CircleCi or other platforms.

## Conventions

Magento has strict naming and structural conventions that must be followed if tests are to execute automatically.

* Test file names must end with "Test", e.g. `ConfigTest.php`.
* Tests must live under `Test/Unit`.
* Test classes must extend `\PHPUnit\Framework\TestCase`
* Test methods must begin with "test", e.g. `public function testTest()`.

## Environment

* Verify that Magento is setup for unit tests
  * `$ composer show magento/magento2-functional-testing-framework`
    * If composer is not found, you may need to install it.
    * `$ curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer`

## Executing

Unit tests can be executed in Magento by running `$ php bin/magento dev:tests:run unit`. This will execute *all* unit tests defined in `/var/www/html/dev/tests/unit/phpunit.xml.dist`. To reduced the number of unit tests that are executed, edit the `phpunit.xml.dist` file to include only tests from `<directory suffix="Test.php">../../../app/code/*/*/Test/Unit</directory>`.

## Resources

* https://www.codementor.io/pekebyte/how-to-write-magento-2-unit-tests-under-a-custom-module-mml63lrpj
* https://www.mageplaza.com/devdocs/magento-2-unit-test/
* https://www.mageplaza.com/devdocs/magento-2-run-tests.html
* https://devdocs.magento.com/mftf/docs/introduction.html
* https://devdocs.magento.com/guides/v2.3/get-started/web-api-functional-testing.html
* https://magento.stackexchange.com/questions/263471/magento-2-3-write-unit-test-for-observer\

# User Interface Design

The NS8 Protect Settings UI will be housed in an iframe within the Magento admin interface.

## Data transfer

### Passing data to NS8 Protect

The iframe in the Magento interface will pass data to the NS8 Protect app via query parameters. The following params need to be passed:
- TBD

### Passing data back to Magento

The NS8 app will pass data back to Magento after processes have completed via specific API calls (documented at *LINK*).

# Modules and Extensions

## CLI

* Copy the module contents from your local project directory into the remote server at `var/www/html/app/code/NS8/CSP2`.
* Install the module by running `$ php bin/magento setup:upgrade`
  * If the CSS styles of the site are incorrect afterwards, you may need to also run `$ php bin/magento setup:static-content:deploy`

### Resources

* https://www.mageplaza.com/devdocs/magento-2-command-line-interface-cli.html

## Module Lifecycle

All modules have the idea of schema versions and data versions. To make changes to the module data/schema you need to implement one of the lifecycle hooks by creating/modifying files in the `Setup` directory. The most important implementations would be `InstallData`, `UpgradeData`, `InstallSchema`, `UpgradeSchema`.

### Install vs Upgrade

Install lifecycle events are run only when the module is first installed. Any subsequent changes to this code will be ignored by Magento under normal circumstances. Upgrade events are run whenever Magento detects a new version of the module has been loaded. In both cases special steps need to be taken to ensure changed code is run.

### Trigger Module Install
1. Implement `Install[Data/Schema]` in the Setup directory that implements `Install[Data/Schema]Interface` as well as the install function.
2. Deploy new code to Magento
3. If this module has been installed to this Magento instance already you need to force Magento to treat it as a new install. Log into the MySQL instance (`$ mysql -u magento_db_user -p magento2`), and remove the record for this module from the `setup_module` table: `$ delete from setup_module where module like '%ns8%';` and `$ delete from integration where name like '%ns8%';`
4. Run `$ bin/magento setup:upgrade`

### Trigger Module Upgrade
1. Update `Upgrade[Data/Schema]` in the Setup directory that implements `Upgrade[Data/Schema]Interface` as well as the upgrade function.
2. In `etc/module.xml` find the `setup_version` attribute and increase it to a higher version (eg 1.0.0 -> 1.0.1)
3. Deploy new code to Magento
4. Run `bin/magento setup:upgrade`
5. Changes should run, you can also verify version by querying for the module in the `setup_module` table that has schema/data versions.


### Useful commands

* Disable cache: `$ php bin/magento cache:disable`
* Clean cache: `$ php bin/magento cache:clean`
* List all modules: `$ php bin/magento module:status`

## Installing as an extension

### Install composer

```
$ cd ~
$ sudo curl -sS https://getcomposer.org/installer | sudo php
$ sudo mv composer.phar /usr/local/bin/composer
$ sudo ln -s /usr/local/bin/composer /usr/bin/composer
```

### Install extension

Our normal development process installs our code as a module instead of an extension which means we can't access tools like uninstall from the UI. To install our code as an extension you need to have the code available as a composer repo and add it as a dependency within the Magento instance's composer config.

* On your Magento instance, create an ssh key: `ssh-keygen`
* In the magento root add your git repo as a Composer repository: https://getcomposer.org/doc/05-repositories.md#vcs
* Add CSP2 dependency, from Magento composer.json file add a new entry in the `require` section similar to `"ns8/csp2": "*@dev"
* From Magento run `composer upgrade`

## References

### General

* https://www.mageplaza.com/magento-2-module-development/
* https://www.mageplaza.com/kb/how-flush-enable-disable-cache.html

### Web API

* https://inchoo.net/magento-2/magento-2-custom-api/
* https://webkul.com/blog/magento2-custom-rest-api/
* https://devdocs.magento.com/guides/v2.3/extension-dev-guide/service-contracts/service-to-web-service.html
* https://devdocs.magento.com/guides/v2.3/rest/list.html
* https://devdocs.magento.com/redoc/2.3/admin-rest-api.html

# Components

## Component Development

### Resources

* https://devdocs.magento.com/guides/v2.3/extension-dev-guide/build/create_component.html
* https://devdocs.magento.com/guides/v2.3/extension-dev-guide/build/composer-integration.html


## Logging

Here is an example of how to log to various different files in Magento:

```php
<?php
namespace Mageplaza\HelloWorld\Post;
class Post extends \Magento\Framework\View\Element\Template
{
        protected $_logger;

    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Psr\Log\LoggerInterface $logger,
        array $data = []
    )
    {
        $this->_logger = $logger;
        parent::__construct($context, $data);
    }

    public function testLogging()
    {
        // monolog's Logger class
        // MAGENTO_ROOT/vendor/monolog/monolog/src/Monolog/Logger.php

        // saved in var/log/debug.log
        $this->_logger->debug('debug1234');
        //Output: [2017-02-22 04:48:44] main.DEBUG: debug1234 {"is_exception":false} []

        $this->_logger->info('info1234');
        // Write to default log file: var/log/system.log
        //Output: [2017-02-22 04:52:56] main.INFO: info1234 [] []

        $this->_logger->alert('alert1234');
        // Write to default log file: var/log/system.log
        //Output: [2017-02-22 04:52:56] main.ALERT: alert1234 [] []

        $this->_logger->notice('notice1234');
        // Write to default log file: var/log/system.log
        //Output: [2017-02-22 04:52:56] main.NOTICE: notice1234 [] []

        // Write to default log file: var/log/system.log
        $this->_logger->error('error1234');
        //Output: [2017-02-22 04:52:56] main.ERROR: error1234 [] []

         // Write to default log file: var/log/system.log
        $this->_logger->critical('critical1234');
        //Output: [2017-02-22 04:52:56] main.CRITICAL: critical1234 [] []

        // Adds a log record at an arbitrary level
        $level = 'DEBUG';
        // saved in var/log/debug.log
        $this->_logger->log($level,'debuglog1234', array('msg'=>'123', 'new' => '456'));
        //Output: [2017-02-22 04:52:56] main.DEBUG: debuglog1234 {"msg":"123","new":"456","is_exception":false} []

        // Write to default log file: var/log/system.log
        $level = 'ERROR';
        $this->_logger->log($level,'errorlog1234', array( array('test1'=>'123', 'test2' => '456'), array('a'=>'b') ));
        //Output: [2017-02-22 04:52:56] main.ERROR: errorlog1234 [{"test1":"123","test2":"456"},{"a":"b"}] []

    }

}
```

### References
* https://www.mageplaza.com/devdocs/how-write-log-magento-2.html

## Observers

### Orders

### Resources

* https://magento.stackexchange.com/questions/154838/magento-2-how-to-get-order-data-in-observer-on-success-page
* https://www.cloudways.com/blog/magento-2-events-observers/
* https://devdocs.magento.com/guides/v2.3/extension-dev-guide/events-and-observers.html
* https://www.mageplaza.com/magento-2-module-development/magento-2-events.html

## API

### Resources

* https://magento.stackexchange.com/questions/195612/getting-data-from-external-webservice
* https://devdocs.magento.com/guides/v2.3/get-started/gs-web-api-request.html
* https://hotexamples.com/examples/-/Zend%255CHttp%255CClient/-/php-zend%255chttp%255cclient-class-examples.html
* https://mage2.pro/t/topic/485
* https://stackoverflow.com/questions/25538440/using-zend-http-client-to-send-json-post
* https://magento.stackexchange.com/questions/253414/magento-2-3-upgrade-breaks-http-post-requests-to-custom-module-endpoint
* https://stackoverflow.com/questions/13066687/send-request-after-checkout-process-in-magento
* https://devdocs.magento.com/guides/v2.3/rest/generate-local.html
* https://devdocs.magento.com/guides/v2.3/extension-dev-guide/service-contracts/service-to-web-service.html

## Views

### Pitfalls

* Magento reads the PHP DocBlocks of some files to determine what objects to pass them as parameters. If you see an error like `Type Error occurred when creating object: NS8\CSP2\Controller\Adminhtml\Settings\Index\Interceptor`, go double-check that your constructor signature matches its DocBlocks.

### Resources

* https://devdocs.magento.com/guides/v2.3/coding-standards/docblock-standard-general.html

# Magento Marketplace Standards

## PHP Standards

The platform extension must conform to Magento's marketplace rules. To get your local development environment configured to quality test for submission, follow these steps. These steps are in addition to the [Magento Coding Standard steps](https://github.com/magento/magento-coding-standard)

* Install PHP
  * Enable `mbstring` extension
* Install `Composer`:
* Install `simple-xml`
* Run lint: `$ phpcs --standard=Magento2 --ignore=*/vendor/* ./module`
* Auto-fix errors: `$ phpcbf --standard=Magento2 --ignore=*/vendor/* ./module`

### Resources
* https://github.com/squizlabs/PHP_CodeSniffer/wiki/Advanced-Usage#ignoring-files-and-folders
* https://linuxize.com/post/how-to-install-and-use-composer-on-ubuntu-18-04
* https://www.php.net/manual/en/simplexml.installation.php
* https://stackoverflow.com/questions/31690561/composer-error-while-installing-laravel-mbstring-is-missing for help
