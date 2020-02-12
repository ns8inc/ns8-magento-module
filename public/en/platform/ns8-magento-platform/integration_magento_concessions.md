# Platform Concessions Within Magento For the Protect SDK

1. [Platform Concessions Within Magento For the Protect SDK](#platform-concessions-within-magento-for-the-protect-sdk)
   1. [Concessions Regarding Authentication Architecture](#concessions-regarding-authentication-architecture)
   1. [Concessions Regarding Session Data](#concessions-regarding-session-data)
   1. [Concessions Regarding Configuration Data](#concessions-regarding-configuration-data)
   1. [Concessions Regarding Order Data](#concessions-regarding-order-data)
   1. [Concessions Regarding Credit Card Data & Payment Functionality](#concessions-regarding-credit-card-data--payment-functionality)
   1. [Concessions Regarding Permissions](#concessions-regarding-permissions)

There are several Magento concessions made within the NS8 Protect Module to allow more fluid integration with the Protect SDK and the associated API. These compromises were made to permit the best code quality possible while still allowing an elegant, flexible implementation.

## Concessions Regarding Authentication Architecture

In an ideal scenario, the Protect SDK would be solely responsible for managing authentication and OAUTH integration with the API. Given Magento/Zend's integration policies and permissions structure, the module is instead set-up to reach out to Protect's API endpoints (discussed in the `integration_oauth.md` documentation) outside of the API using standard Zend authentication classes. The final access token utilized for making Protect API requests through the SDK is then stored as a configuration value rather than somewhere within the SDK. Additionally, all authorized protect requests relating to events should have an authorized user associated with them. Given that new orders can be created by merchant customers, this is not always the case, so a default user known as `default` will be associated with the action if the event is triggered outside of the Magento Admin.

It is also worth noting that many e-commerce platforms permit module authentication registration during the install-process. Magento's integration architecture patterns do not allow for this pattern forcing us to guide admin-users through the remaining steps of platform integration. the API is also unable to be fully away of installation event as it will only receive data once the Magento Integration Authorization is complete.

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

## Concessions Regarding Order Data

As an analytics and fraud scoring application, NS8 Protect relies heavily on order data and benefits from whatever can be reaped from the platform. Magento's Order Model for Guest Orders vs Registered Users is not consistent therefore causing explicit steps to be taken for data validation. Wwe must account for null or non-existent values for such customer properties as first or last name. Additionally, unique customer hashes to represent customer IDs must be generated randomly in cases where the Guest Order does not contain na email address. In light of all of this, careful consideration must be exercised when integrating data from Magento's Order Models and account for a more relaxed data structure.

## Concessions Regarding Credit Card Data & Payment Functionality

Credit card models are not consistent nor standardized across the Magento framework depending on what payment provider is being utilized. The lack of abstraction and standardization (e.g. through interfaces) forces an increase in default fields, sanitization practices, and requires greater flexibility/support for both data-requirements as well as field names.

Outside of data models, credit card processing through Authorize.net in Magento impacts the state in which orders are set. These orders through Authorize.net are automatically set to a state of "processing" and a status history record is added making it impossible to elegantly determine if an order is "new" vs "existing" in context of order data thus additional steps must be taken to account for checking Order Creation vs Order Update events.

## Concessions Regarding Permissions

At the time of developing this module, there was very little documentation surrounding Magento 2's permissions logic and intended implementation-standards. The lack of available information resulted in "guest & check" development of the module's `integration/api.xml` file. The implementation made available in this module permits required access and functionality to allow data access for the NS8 Protect API.
