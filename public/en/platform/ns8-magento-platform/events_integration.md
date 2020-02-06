# Protect SDK Events Integration

## How are events defined?
Events, as related to the Protect SDK, are defined as actions that occur on the client platform (where the SDK is integrated) that are relevant to NS8's scoring. Examples of events include:
* An update to the Merchant (the e-commerce store) has occurred.
* An order has been placed
* An order has been updated or has an attribute changed after placement.

## How does the Protect SDK integrate with Magento for events?
NS8's approach to emitting events to NS8's API is to take advantage of the observers currently built-in to Magento. This allows a simple listener that respects the intended Magento architecture and only invokes Protect SDK code as needed.

For orders, the NS8 Protect module hooks into Magento's `sales_order_save_after` event and determines if the order is a new order or one that is existing and has been updated. If an order has already been scored then it is not considered new.

The SDK offers predefined constants for the Order Action based on it being new vs existing and updated:
```php
use NS8\ProtectSDK\Actions\Client as ActionsClient;

// A new order
$action = ActionsClient::CREATE_ORDER_ACTION;

// An existing order that has been updated
$action = ActionsClient::UPDATE_ORDER_STATUS_ACTION;
```
Through leveraging Magento's observer, we can easily fetch the order data and allow it to be passed to the SDK:
```php
public function execute(Observer $observer) : void
{
  try {
    $order = $observer->getEvent()->getOrder();
    $orderData = $order->getData();
  } catch (\Throwable $t)) {
    // Error handling
  }
  ````

  One more critical thing to note is prior to actually sending the event to the NS8 Protect API, we ensure any configuration values required (such as the Protect Access token and Authorized user value) are in place for access by the SDK's HTTP client.

  ```php
// Init SDK configuration
$this->config->initSdkConfiguration();

// The initSdkConfiguration method sets the values as needed
public function initSdkConfiguration() : void
{
    SdkConfigManager::initConfiguration();
    $sdkEnv = SdkConfigManager::getEnvironment();
    SdkConfigManager::setValue('platform_version', 'Magento');
    SdkConfigManager::setValue(sprintf('%s.authorization.auth_user', $sdkEnv), $this->getAuthenticatedUserName());
    SdkConfigManager::setValue(sprintf('%s.authorization.access_token', $sdkEnv), $this->getAccessToken());
}
  ```
  Finally the event is submitted so our observer method would look roughly like:
  ```php
  use NS8\ProtectSDK\Actions\Client as ActionsClient;

try {
    $order = $observer->getEvent()->getOrder();
    $orderData = $order->getData();

    $state = $order->getState();
    $status = $order->getStatus();
    $oldStatus = $this->addStatusHistory($order);
    $isNew = $state == 'new' || $status == 'pending';
    $action = (isset($oldStatus) || !$isNew) ? ActionsClient::UPDATE_ORDER_STATUS_ACTION :  ActionsClient::CREATE_ORDER_ACTION;

    // Initialize the configuration
    $this->config->initSdkConfiguration();

    // Set the action which sends the data to the NS8 Protect API
    ActionsClient::setAction($action, ['order'=>$orderData]);

  } catch (\Throwable $t)) {
    // Error handling
  }
  ```

The merchant update configuration works in similar fashion by utilizing Magento's `admin_system_config_save` event.
```php
use NS8\ProtectSDK\Actions\Client as ActionsClient;

try {
  // Prepage data for submission via the API
  $eventData = $observer->getEvent()->getData();
  $data = ['eventData' => $eventData];

  // Initialize the configuration
  $this->config->initSdkConfiguration();

  // Set the action which sends the data to the NS8 Protect API
  ActionsClient::setAction(ActionsClient::UPDATE_MERCHANT_ACTION, $data);

} catch (\Throwable $t)) {
  // Error handling
}
```

The Protect SDK predefines known events as constants. All of these events are made avaiable in a protected variable called `$predefinedEvents`. The variable is initially defined within the class as:
```php
protected $predefinedEvents = [
    self::DEFAULT_FLOW_COMPLETED_EVENT,
    self::ON_DISABLE_EXTENSION_EVENT,
    self::ON_ENABLE_EXTENSION_EVENT,
    self::ON_INSTALL_PLATFORM_EVENT,
    self::ON_UPDATE_EXTENSION_EVENT,
    self::ORDER_READY_EVENT,
    self::PAYMENT_DECORATED_EVENT,
    self::PAYMENT_SCORED_EVENT,
    self::SESSION_DECORATED_EVENT,
    self::SESSION_SCORED_EVENT,
    self::UPDATE_CUSTOMER_VERIFICATION_STATUS_EVENT,
    self::UPDATE_EQ8_SCORE_EVENT,
    self::UPDATE_ORDER_RISK_EVENT,
    self::UPDATE_ORDER_STATUS_EVENT,
];
```
