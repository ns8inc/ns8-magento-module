# Protect OAUTH Integration with the Magento Platform

1. [Protect OAUTH Integration with the Magento Platform](#protect-oauth-integration-with-the-magento-platform)
   1. [How Does It Work](#how-does-it-work)
   2. [Related URLs](#related-urls)
   3. [How are OAUTH requests handled?](#how-are-oauth-requests-handled)

## How Does It Work

The Protect API requies an authorization token be set with all requests except for those requesting generic tracking. In order to accomodate this, an access token, specific to the merchant, is stored in Magento's store configuration through the path `ns8/protect/token`. Once this is in-place, it persists as is and is not expected to change.

Upon initial installation/utlization of NS8 Protect, this value is expected to be empty. In order to set this value, we rely on Magento's IntegrationServiceInterface & OauthServiceInterface to handle the majority of authorization. In general terms, we fetch the access token for the NS Protect API initially by:

* Loading the custom module's integration consumer
* Using the Magento OauthServiceInterface implemented class to get the access token (e.g. `$accessTokenString = $this->oauthService->getAccessToken($consumerId);`)
* We then parse out the access token string
* This access token is exchanged, along with the consumer key, for the Protect Token which is then stored it in the configuration path

## Related URLs

* `<PROTECT_API_URL>/protect/magento/callback` is used for OAUTH callback functionality
* `<PROTECT_API_URL>/protect/magento/identity` is used for OAUTH identity functionality
* `<PROTECT_CLIENT_URL>/init/magento/access-token` is used to exchange the consumer key and access token for a protect token.

## How are OAUTH requests handled?

The core controller for handling these requests in Magento can be found in the [Magento Install Controller](https://github.com/ns8inc/ns8-protect-api/blob/master/src/platforms/magento/controllers/MagentoInstall.ts).

OAUTH callback logic: The OAUTH logic within the Magento Install Controller is initiated with a call to `<PROTECT_API_URL>/protect/magento/callback`. This POST call must contain:

* an `oauth_consumer_key` value
* an `oauth_consumer_secret` value
* an `store_base_url` value
* an `oauth_verifier` value

The store URL is parsed and an OAUTH stash is created utilizing the key passed in the request body. An authorization call is made to the Magento host's `/index.php/oauth/token/request` endpoint and the response is then parsed. Provided it was successful, the NS8 API sets the access parameters returned such as the request token and request token secret. These parameters are then used to call the Magento host's `/index.php/oauth/token/access` endpoint to get the final access information needed to submit requests to the Magento API. Provided this request was successful, the returned access token, access token secret, and the original oauth key and secret are all set to be associated with the merchant.

OAUTH identity logic: Once the request process has reached this stage, an `oauth_consumer_key` parameter and `success_call_back` parameter are included in the request. The OAUTH info is validated using the consumer key and if the validation is successful then a redirect to the `success_callback` value occurs.

Getting an access token: The functionality for getting an access token is simply validating the merchant exists. The request should contain an ouath consumer key and an access token as stated above. A merchant is looked-up based on the oauth consumer key and then formally verified by ensuring the access token passed in matches the service integration token for that merchant.
