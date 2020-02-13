# Protect Client Integration

The Protect Client SDK is a JavaScript SDK that supports front-end integration and interaction with NS8 Protect services. For Magento use-cases, the SDK offers an elegant solution for instantiating the NS8 Protect iFrame that users are able to interact with to review order details, view/update settings, etc.

## How is the Protect Client SDK loaded for use in Magento?

The Protect Client SDK is loaded directly from NS8's CDN in order to acquire the latest functionality. It is initialized within a script tag with the URL for the asset being retrieved from the Protect PHP SDK

```php
use NS8\ProtectSDK\Config\Manager as SdkConfigManager;

/**
* Get the URL of the protect-js-sdk bundle
*
* @return string The URL
*/
public function getProtectJsSdkUrl(): string
{
    return SdkConfigManager::getEnvValue('urls.js_sdk');
}

```

```html
<script type="text/javascript" src="<?= $block->url->getProtectJsSdkUrl() ?>"></script>
```

## How does the Protect Client SDK receive data required for use?

The required key attributes that the SDK uses for initialization are rendered into the `phtml` file that contains the JavaScript for displaying the NS8 Protect iFrame. These values are passed in as a JavaScript object for the Client Config initialization which is then passed in as an argument to the `Protect.createClient` method. Further information regarding initialization can be found in [the JS SDK Client documentation](https://github.com/ns8inc/protect-js-sdk/blob/master/public/en/platform/protect-js-sdk/client.md).

```javascript
var eventBinding = {};
eventBinding[Protect.EventName.ORDER_DETAIL_NAME_CLICK] = navigateToMagentoOrderDetails;
var clientConfig = new Protect.ClientConfig({
  accessToken: '<?= $block->config->getAccessToken(); ?>',
  protectClientUrl: '<?= $block->url->getClientUrl(); ?>',
  eventBinding: eventBinding,
  iFrameConfig: {
    attachToId: containerElId,
    classNames: ['ns8-protect-client-iframe'],
  },
});
var protectClient = Protect.createClient(clientConfig);
protectClient.render(requestedPage, orderIncrementId);
```

Looking at the Client Configuration, the following attributes are present:

* `accessToken`: The access token to authenticate with NS8 Protect API
* `protectClientUrl`: The root Client URL to be used for the iFrame and requests
* `eventBinding`: Events to bind between the iFrame and the page to allow page/browser functionality from events occurring in the iFrame
* `iFrameConfig`: Configuration parameters to be used when instantiating the iFrame
  * `attachToId` The element ID that the iFrame should be attached to.
  * `classNames`: Class names that should be present in the iFrame element.

## Rendering the iFrame

The iFrame is rendered in the `protectClient.render(requestedPage, orderIncrementId);` . For this call we see these parameters set:

* `requestedPage`: The page we want to instantiate in the iFrame. For the context of the Magento module, we choose to make the following available:
  * `DASHBOARD`: The dashboard for NS8 Protect
  * `ORDER_RULES`: The configurable order rules page
  * `SUSPICIOUS_ORDERS`: The page for viewing a list of suspicious orders based on filterable values.
  * `ORDER_DETAILS`: The page showing specific details about an order. If this page is passed in as an argument, the `orderIncrementId` must be passed in as well so the Protect Client knows which order to retrieve information for.
