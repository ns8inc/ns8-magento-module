# NS8 Protect Extension for Magento 2

[![CircleCI](https://circleci.com/gh/ns8inc/protect-integration-magento.svg?style=svg&circle-token=763e49eaad4690e1be48369b54c62d99cf049e4f)](https://app.circleci.com/pipelines/github/ns8inc/protect-integration-magento)
[![Latest Stable Version](https://poser.pugx.org/ns8/protect-magento/v)](//packagist.org/packages/ns8/protect-magento)
[![License](https://poser.pugx.org/ns8/protect-magento/license)](//packagist.org/packages/ns8/protect-magento)
[![Total Downloads](https://poser.pugx.org/ns8/protect-magento/downloads)](//packagist.org/packages/ns8/protect-magento)
[![Monthly Downloads](https://poser.pugx.org/ns8/protect-magento/d/monthly)](//packagist.org/packages/ns8/protect-magento)

This is the source code for the NS8 Protect extension for use on the Magento eCommerce platform. If you have landed here, you probably want to install Protect from the [Magento Marketplace](https://marketplace.magento.com/ns8-protect-magento.html).

If you are are a developer or an admin user attempting a manual install of Protect on your Magento 2 instance, you can follow the steps below.

## Requirements

The following items are requirements for using Protect with Magento:

- Magento version 2.3.* (all 2.3 versions are supported)
- PHP 7.1+

## Manual Install

1. SSH to the Magento server and navigate to the root path of the Magento install, frequently in `/var/www/html`.
1. `$ composer require ns8/protect-magento`
1. `$ sudo bin/magento setup:upgrade`
1. `$ sudo bin/magento cache:clean`
1. `$ sudo bin/magento cache:enable`
1. `$ sudo bin/magento module:status`
1. Confirm that NS8 Protect is listed.

## License

See [License](./LICENSE)

 © [ns8inc](https://ns8.com)
