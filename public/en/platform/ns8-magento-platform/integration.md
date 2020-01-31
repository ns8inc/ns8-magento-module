# Protect Integration with the Magento Platform

## Discovery

* [x] Does the platform support [WebHooks](https://en.wikipedia.org/wiki/Webhook)?
  * No
  * [x] What events are supported?
    * none
* [x] Is the platform cloud hosted?
  * The platform requires an individual installation, but Adobe Cloud and other providers offer turn key SaaS solutions to starting a storefront
  * [x] Is there a sandbox for developers?
    * No
  * [x] Can platform extensions be tested on non-production storefronts?
    * Non-production testing requires an invidual storefront instance
* [x] Is the platform self hosted?
  * Yes
  * [x] How complex is the installation of the platform?
    * Magento is extremely fragile. It requires specific versions of PHP and other dependencies and is non-trivial to install/maintain.
  * [x] Can the platform be installed on Docker?
    * Technically, yes, it can be installed on Docker. The RAM requirements are very high, so it is computationally expensive to run locally.
    * [x] Are any docker images available that have the platform pre-installed?
      * Yes, Bitnami and others have pre-built containers. So far, these have no proved useful for local development.
  * [x] Can the platform be installed in a Virtual Machine, like Amazon Lightsail?
    * Yes, Lightsail is the current preferred installation process
  * [x] How often are updates to the platform released?
    * Patch versions are released approximately once a quarter. Magento patch versions are frequently massive with huge numbers of changes. Evaluating the release notes carefully is strongly encouraged.
  * [x] How are updates applied?
    * Adobe Cloud customers receive updates automatically. Other providers' policies vary. Self-host customers must manually download and apply the updates.
  * [x] What versions of the platform do you need to support?
    * We currently support Magento 2.3.*, although extensive testing has only been applied to 2.3.2 and 2.3.3. 2.3.4 is about to be released.
* [x] Is the platform both self hosted and cloud hosted?
  * Yes
  * [x] What is the ratio of merchants using cloud vs self hosted installs?
    * Current estimates put the cloud based installs at 70% or greater of the current market.
  * [x] Do the cloud and self hosted instances use the same code base?
    * No. The Adobe Cloud version is the Magento Commerce edition. Most self-hosted storefronts use the Magento Open Source edition. Both use portions of the same code base, but Commerce has additional functionality that is not included in the Open Source edition.
* [x] What language is the platform written in?
  * PHP
  * [x] Does the platform have an SDK?
    * No
  * [x] Does the platform support JavaScript?
    * Yes
    * [x] How does JavaScript injection into the platform work?
      * Using `.phtml` files which is a PHP specific convention to inject JavaScript into a page
* [x] Does the platform have an API?
  * Yes
  * [x] What security measures are implemented around the API?
    * All API calls must be authenticated. Platform integrations must implement an OAuth service integration to receive the access tokens, keys and secrets required to authenticate with the API. This OAuth integration must explicitly define which resources it requires access to and what level of permission is required for each of those resources.
  * [x] How does an integration developer authenticate with the API?
    * Integrations making API calls authenticate with four different tokens and secrets which are established via OAuth.
* [x] Are platform integrations published to a centralized store or marketplace for the platform?
  * Yes. All integrations are published to the Magento Marketplace.
  * [x] What is the publication process?
    * Integrations are packaged in a `.zip` file and submitted to the Magento Marketplace with release notes and supporting documentation.
  * [ ] What are the publication requirements?
  * [ ] How fast can updates be pushed to the store?
  * [ ] How does the store manage backwards compatibility requirements (if any)?
