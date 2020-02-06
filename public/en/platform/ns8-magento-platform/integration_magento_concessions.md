# Platform Concessions Within Magento For the Protect SDK
There are several Magento concessions made within the NS8 Protect Module to allow more fluid integration with the Protect SDK and the associated API. These compromises were made to permit the best code quality possible while still allowing an elegant, flexible implementation.

## Concessions Regarding Authentication Architecture
In an ideal scenario, the Protect SDK would be solely responsible for managing authentication and OAUTH integration with the API. Given Magento/Zend's integration policies and permissions structure, the module is instead set-up to reach out to Protect's API endpoints (discussed in the `integration_oauth.md` documentation) outside of the API using standard Zend authentication classes. The final access token utilized for making Protect API requests through the SDK is then stored as a configuration value rather than somewhere within the SDK. Additionally, all authorized protect requests relating to events should have an authorized user associated with them. Given that new orders can be created by merchant customers, this is not always the case, so a default user known as `default` will be associated with the action if the event is triggered outside of the Magento Admin.

## Concessions Regarding Session Data
Session data is vital to NS8 Protect as it allows correlation with the True Stats integration (as discussed in `integration_true_stats.md`) and provides greater analysis information. However, Magento, like many platforms, has its own preferred ways of fetching various session information such as the User IP Address, User Agent, Language, etc.) and therefore is not capable of being extracted into the SDK. In light of this, two adjustments have been made:
* By default, if no session data exists with a request to the NS8 Protect API, the SDK will try to parse out the request IP Address & User Agent based on `$_SERVER` information made available
* Events triggered allow session data to be passed in addition to other available data (such as `order` data). This is examplified in the `integration_true_stats.md` & `integration_events.md` documentation.

## Concessions Regarding Configuration Data
The Proect SDK's configuration is based on JSON files that can be passed into the Configuration Constructor upon initialization. The SDK is designed to statically reference the configuration so once it is initialized, the configuration information is made available wherever it is needed. Magento provides its own configuration information and typically stores configuration data in
the MySql table `core_config_data`. In order to accomodate Magento's configuration architecture and better
support stateless functionality, the custom module utilizers a Config Helper class (`NS8\Protect\Helper\Config`) that provides a method for initializing the SDK:
```php
/**
 * Init SDK Configuration class for usage
 */
public function initSdkConfiguration() : void
{
    SdkConfigManager::initConfiguration();
    $sdkEnv = SdkConfigManager::getEnvironment();
    SdkConfigManager::setValue('platform_version', 'Magento');
    SdkConfigManager::setValue(sprintf('%s.authorization.auth_user', $sdkEnv), $this->getAuthenticatedUserName());
    SdkConfigManager::setValue(sprintf('%s.authorization.access_token', $sdkEnv), $this->getAccessToken());
}
```
This method is invoked for requests where the SDK is about to be utilized to set SDK configuration information from Magento's configuration logic where required (for needs such as authentication).
