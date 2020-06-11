# NS8 Protect Extension for Magento 2

[![CircleCI](https://circleci.com/gh/ns8inc/protect-integration-magento.svg?style=svg&circle-token=763e49eaad4690e1be48369b54c62d99cf049e4f)](https://app.circleci.com/pipelines/github/ns8inc/protect-integration-magento)
[![Latest Stable Version](https://poser.pugx.org/ns8/protect-magento/v)](//packagist.org/packages/ns8/protect-magento)
[![License](https://poser.pugx.org/ns8/protect-magento/license)](//packagist.org/packages/ns8/protect-magento)
[![Total Downloads](https://poser.pugx.org/ns8/protect-magento/downloads)](//packagist.org/packages/ns8/protect-magento)
[![Monthly Downloads](https://poser.pugx.org/ns8/protect-magento/d/monthly)](//packagist.org/packages/ns8/protect-magento)

This is the source code for the NS8 extension for Magento 2. Most users can automatically install NS8 through the [Magento Marketplace](https://marketplace.magento.com/ns8-protect-magento.html). However, if you are a developer or admin user and would like to manually install NS8 on your Magento 2 instance, you can follow the steps below.

## Requirements

The system requirements to use NS8 with Magento are:

- Magento version 2.3.* (all 2.3 versions are supported)
- PHP 7.1+

Additionally, you must configure all of Magento’s background task operations to run automatically.

## Manual Install

1. SSH to the Magento server and navigate to the root path of the Magento install, frequently in `/var/www/html`.
1. `$ composer require ns8/protect-magento`
1. `$ sudo bin/magento setup:upgrade`
1. `$ sudo bin/magento cache:clean`
1. `$ sudo bin/magento cache:enable`
1. `$ sudo bin/magento module:status`
1. After running the commands outlined in steps two through six, you can access NS8 through your Magento instance. 

## License

For more information about NS8, see our [License](./LICENSE) or visit us at [ns8inc](https://ns8.com).
