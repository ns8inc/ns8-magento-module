# Protect OAUTH Integration with the Magento Platform

## How Does It Work?
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
