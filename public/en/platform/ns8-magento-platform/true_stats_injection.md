# TrueStats Injection

## What is the TrueStats script?
The TrueStats script allows NS8 to accurately track a user's journey through a client website by firing AJAX calls to NS8's Protect servers based on events (e.g. the page loading). The script renders with the required configuratio and initial call set-up in the response of the script request. Below is an example of what the TrueStats script looks like when successfully delivered:
```js
if (!Aggregator){var Aggregator=function(o){
    var d=document,p=Aggregator.prototype;this.options=o;this.q=[];d.cookie='__na_c=1';p.p=function(c){return function(){
    this.q.push([c,arguments])}};p.setPerson=p.p(4,arguments);p.logEvent=p.p(0,arguments);p.logPageview=p.p(1,arguments);
    p.ready=p.p(2,arguments);p.logOutbound=p.p(3,arguments);p.updatePerson=p.p(5,arguments);p.updateSession=p.p(6,arguments);
    p.updateEvent=p.p(7,arguments);p.push=p.p(8,arguments);var s=d.createElement('script');s.type='text/javascript';
    s.async=true;(function(i){s.onreadystatechange=function(){if(s.readyState=='loaded'||s.readyState=='complete'){i.run();}};
    s.onload=function(){i.run();}})(this);e=location.protocol=='https:';s.src='http'+(e?'s://':'://')+
    (e&&navigator.userAgent.indexOf('MSIE')>-1?'test-api-v1.ns8.com':'test-api-v1.ns8.com').replace('{0}',o.projectId)+
    '/web?t='+Math.floor((new Date()*.00001)/36);var e=d.getElementsByTagName('script')[0];e.parentNode.insertBefore(s,e);
}}

var ns8ds = new Aggregator({
    "timing": true,
    "protect": true,
    "projectId": "CLIENT_PROJECT_ID"
});
ns8ds.logPageview();
```
Please notice that "projectId" configuration value is already populated in this response. NS8 Protect does this by validating and utilizing the authorization token passed in with the POST request.

## How is the TrueStats script fetched?
The script is returned via an HTTP POST call to the `/api/init/script` endpoint that is JSON encoded. Authorization headers are required when sending this request to ensure the Project Id is populated. The fetching functionality is simplified by using the Protect SDK:
```php
use NS8\ProtectSDK\Http\Client as HttpClient;

class Script
{
   /**
     * Get the TrueStats tracking script (wrapped in HTML <script> tags).
     *
     * @return string The tracking script
     */
    public function getScriptHtml(): string
    {
        // Init the SDK configuration so auth information is present then fetch the script
        $this->config->initSdkConfiguration();
        $script = (new HttpClient())->sendNonObjectRequest('/init/script');

        // Call json_decode to remove quotes if present
        return is_string($script) ? sprintf('<script>%s</script>', json_decode($script)) : '';
    }
}
```

HTML output calling the function above:
```html
<!-- TrueStats tracking script start -->
 <?= (new Script())->getScriptHtml() ?>
<!-- TrueStats tracking script end -->
```

## Outside components required for TrueStats
When submitting events to NS8 Protect, session information is required to reconcile events such as  an `Order Creation` with history logged via TrueStats. The `session` object must contain the following at a minimum:
* `ip`: IP Address of user when placing the order
* `userAgent`: User Agent of the user when placing the order

The following optional information may be included as well:
* `AcceptLanguage`: The Accept Language (e.g. `en`) for the user request
* `screenHeight`: The device screen height for the user request
* `screenWidth`: The device screen width for the user request

In order to reconcile data between TrueStats and the Order event, IP and User Agent must be present. If they are not present, this can lead to empty information for `Session Details` and `Navigation History` in the NS8 Protect Order Details view.

Here is an example utilizing the Protect SDK for sending a Magento Order while including session information (further information, including this example is available in the Events Integration documentation):
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

    // Include Session Data for True Stats integration
    $sessionData = [
            'acceptLanguage' => $this->header->getHttpAcceptLanguage(),
            'id' => $this->customerSession->getSessionId(),
            'ip' => $this->request->getClientIp(),
            'screenHeight' => $this->session->getScreenHeight(),
            'screenWidth' => $this->session->getScreenWidth(),
            'userAgent' => $this->header->getHttpUserAgent(),
        ];

    // Set the action which sends the data to the NS8 Protect API
    ActionsClient::setAction($action, ['order'=>$orderData, 'session' => $sessionData]);

  } catch (\Throwable $t)) {
    // Error handling
  }
```
