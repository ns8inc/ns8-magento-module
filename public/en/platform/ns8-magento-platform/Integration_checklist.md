# Protect Platform Integration Checklist

This represents a list of discovery questions which should be answered to inform your decision making around developing an eCommerce platform integration with Protect. In general, the term `platform` refers to the specific eCommerce platform you are targeting (e.g. Shopify, Magento, BigCommerce, etc), and `client` refers to the NS8 Protect Client which is the source of the integration.

## Implementation Strategy

These questions should help guide you through the process of identifying what implementation questions need to be answered as you prepare to plan to approach development and start breaking out discovery and task tickets. Not all of these questions are relevant to all platforms. For example, if the platform supports webhooks and callbacks, you may not need access to the platform's SDK or APIs. The goal of this exploration is to discover:

* How does an integration developer respond to critical events such as Order, Customer and Merchant events?
* How does an integration developer embed the client into the platform in a way that looks and feels native to the platform?
* How does an integration developer handle the platform's install/uninstall/update events?

* [x] How does the platform emit events?
  * Event observable responders can be defined inside integration code for the platform
  * [x] Does the platform support [WebHooks](https://en.wikipedia.org/wiki/Webhook)?
    * No
    * [x] Does the platform support callbacks from webhooks?
      * No
  * [x] Does the platform support direct, language-specific integrations (i.e. if the platform is written in PHP, can you write PHP that executes inside the platform)?
    * Yes, observables can be declared, see: <https://devdocs.magento.com/guides/v2.3/extension-dev-guide/events-and-observers.html>
* [x] What event notification are supported?
  * [x] Order create
    * Yes, but caveats apply. The "create" event is not triggered for CC orders.
  * [x] Order updates
    * Yes. Magento does not allow direct modification of orders, so edited orders are cancelled and then resubmitted as new orders. Orders moving through state logic do trigger updates.
  * [x] Customer updates
    * Yes, although guests are not treated like regular customers.
  * [x] Merchant updates
    * Yes, but the data model for each type of merchant update is completely different.
  * [x] Platform integration
    * Yes, Uninstall and upgrade are supported.
    * [x] Install
      * There is an "install" event, but it is not useful as manual steps are required after the module is installed from the Marketplace. There is no known event for the succussful installation.
    * [x] Uninstall
      * Yes
    * [x] Update/Upgrade
      * Yes
* [x] Does the platform allow guest orders (i.e. orders from users that are not logged into the storefront)?
  * Yes
  * [x] Is the data model for guest orders consistent with non-guest orders?
    * No
    * [x] What fields are not required for guest orders?
      * Email address is the only field that appears to be consistently required and provided
    * [x] Are guest customers stored in the platform schema or uniquely identifiable?
      * No
* [x] What payment providers does the platform support?
  * [x] Credit Cards
    * Yes
    * [x] Providers
      * [x] Braintree
        * Yes
      * [x] Authorize.Net
        * Yes
    * [x] Is the data model for all CC providers the same? If not, how does it vary?
      * No. Every provider is different. Authorize and Braintree do not supply AVS and CVV codes in the same way. Neither provides a BIN.
    * [x] Does the platform support payment authorization interception (i.e. within the platform, can we cancel an order at the payment provider level)?
      * No
  * [x] Check or Money Order
    * Yes
  * [x] Charge on Delivery
    * Yes
* [x] What language is the platform written in?
  * PHP
  * [x] Does the platform have an SDK?
    * No
  * [x] Does the platform support JavaScript?
    * Yes
    * [x] How does JavaScript injection into the platform work?
      * Injection into `.phtml` pages using PHP conventions
* [x] Does the platform allow customizations to the UI?
  * Yes
  * [x] Can new menu items be added?
    * Menu items can be added by adding custom XML configurations with backing PHP page renderers
  * [x] Can new pages be added?
    * Pages can be added by adding custom XML configurations with backing PHP page renderers
  * [x] Can existing views be extended?
    * Yes
    * [x] Can a grid of customer orders be extended to include new columns?
      * Yes
      * [x] How is the content of those columns determined?
        * A combination of XML configuration and PHP code
      * [x] Can those columns render custom HTML?
        * Yes. Custom CSS can be added to style custom HTML
    * [x] Can an order details page be extended to include new content?
      * Yes.
* [x] Are platform URLs structured in a predictable/deterministic way?
  * Yes
  * [x] Can a link to an order page be predicted given a canonical platform Id for that order?
    * Yes, but the database Ids are different from the display Ids, so both Ids must be stored on the Protect order.
* [x] Are platform IDs consistent between the UI and the database (i.e. if an Order ID is displayed as `1` is that the canonical value of the same Order record in the database)?
  * No. A Magento Order Id in the database will usually be different from the display Id. For example, an order Id might be `39` while the display Id could be `000000047`. Display Ids are intended by Magento to communicate uniqueness if the merchant is running multiple storefronts on the same installation. Protect stores the display Id as the order name.
  * [x] If display names are different from persisted Ids, does the platform include both in event emissions?
    * Yes
  * [x] Can display names be deterministically computed from an event emission?
    * Yes, Magento provides a method to get the Order's "Increment Id", which is the display Id.
* [x] Does the platform have an API?
  * Yes
  * [x] What security measures are implemented around the API?
    * All requests require authentication. Access to any ACL permissions is declared in XML configuration and then registered for request to grant access when the client is installed in the store.
  * [x] How does an integration developer authenticate with the API?
    * Magento provides four separate tokens/keys on the successful client activation which can then be used to construct authenticated API calls.
  * [x] Is the API extensible?
    * Yes
    * [x] Can new routes be defined?
      * Yes. Routes are defined in XML with backing PHP router code.
    * [x] Can API extensions be secured/restricted?
      * Yes. Custom routes can be restricted to user roles. The client integration in Magento defines a custom "NS8 Admin" user role to which custom routes are restricted.
* [x] How does the platform handle OAuth?
  * OAuth is established once when the Protect client's Magento service integration is successfully activated. This generates the Merchant record in Protect, establishes the TrueStats authentication token, and then activates the Magento tokens/keys for interop.
  * [x] How will authentication be established between the platform and the client?
    * The TrueStats token is persisted in the Magento database and included via the PHP SDK with every outbound API call. The Magento tokens are stored in Protect and included as part of the merchant record, which is provided to the lambdas for each step function execution.
  * [x] Does the platform persist authentication tokens or does authentication need happen with every batch of outgoing requests?
    * Request Headers, cookies or query string parameters with authentication tokens must be provided with every request.
* [x] How does the platform implement security?
  * Security rules are defined in XML configuration.
  * [x] What steps are required to grant the integration access to admin specific features of the platform?
    * An ACL definition is defined in XML that specifies which resources at which level of access the client will use.
  * [x] Can access to the client be restricted to specific users or roles?
    * Yes, client access is restricted to a custom "NS8 Admin" user role.
  * [x] Can custom UI changes be restricted to specific users or roles?
    * Partially. Menu items, pages and tabs on pages are restricted. Less control is available for modifications to page elements, like grids.

## Development Strategy

These questions should help guide you through the process of developing your integration locally and remotely. Not all of these questions will apply to every platform. The goal of this checklist is to guide a developer through answering these high level questions:

* How are merchant storefronts hosted in production?
* How can engineers develop and test integrations?
* How to plan an automation strategy around CI pipelines that includes unit and integration testing?

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
      * Yes, Bitnami and others have pre-built containers. So far, these have not proved useful for local development.
  * [x] Can the platform be installed in a Virtual Machine, like Amazon Lightsail?
    * Yes, Lightsail is the current preferred installation process
  * [x] How often are updates to the platform released?
    * Patch versions are released approximately once a quarter. Magento patch versions are frequently massive with huge numbers of changes. Evaluating the release notes carefully is strongly encouraged.
  * [x] How are updates applied?
    * Adobe Cloud customers receive updates automatically. Other providers' policies vary. Self-hosted customers must manually download and apply the updates.
  * [x] What versions of the platform do you need to support?
    * We currently support Magento `2.3.*`, although extensive testing has only been applied to `2.3.2` and `2.3.3`. `2.3.4` is about to be released.
* [x] Is the platform both self hosted and cloud hosted?
  * Yes
  * [x] What is the ratio of merchants using cloud vs self hosted installs?
    * Current estimates put the cloud based installs at 70% or greater of the current market.
  * [x] Do the cloud and self hosted instances use the same code base?
    * No. The Adobe Cloud version is the Magento Commerce edition. Most self-hosted storefronts use the Magento Open Source edition. Both use portions of the same code base, but Commerce has additional functionality that is not included in the Open Source edition.

## Release and Update Strategy

These questions should guide you through the process of planning how to release your integration into a production environment. The goal of this checklist is to guide a developer through the release and update process of the integration.

* [x] Are platform integrations published to a centralized store or marketplace for the platform?
  * Yes. All integrations are published to the Magento Marketplace.
  * [x] What is the publication process?
    * Integrations are packaged in a `.zip` file and submitted to the Magento Marketplace with release notes and supporting documentation. Developers finalize a release, produce the release file ZIP and submit this to the SCs who then handle coordination with Adobe for release to Market.
  * [x] What are the publication requirements?
    * The PHP code must pass the Magento code standard when run through linting. The ZIP file structure must conform to Adobe standards and be installable via Composer.
    * [x] What level of documentation is required?
      * At least one of the following: release notes, user documentation or sales docs.
    * [x] Release notes?
      * Yes, but optional.
    * [x] Sales information?
      * Yes, but optional.
  * [x] How fast can updates be pushed to the store?
    * Turnaround from date of submission to publication is currently greater than 5 business days. This may change.
  * [x] How does the store manage backwards compatibility requirements (if any)?
    * Onus is on the integration developers.
* [ ] When updates are released, is a version history maintained?
  * TBD
  * [ ] How quickly can an update be rolled back in an emergency?
    * TBD
* [ ] How are storefront customers/merchants notified of updates?
  * TBD
* [ ] How quickly are updates distributed across the ecosystem?
  * TBD
* [ ] How quickly can updates to the integration be made by SCs and how quickly are those updates published?
  * TBD
