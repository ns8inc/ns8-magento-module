# Overview

1. [Overview](#overview)
   1. [IDE](#ide)
      1. [IDE Resources](#ide-resources)
   1. [Switchboard Development](#switchboard-development)
      1. [Getting in a new switch](#getting-in-a-new-switch)
      1. [switchboard project](#switchboard-project)
   1. [Debugging PHP](#debugging-php)
   1. [Testing end-to-end](#testing-end-to-end)
      1. [Add a payment method](#add-a-payment-method)

The Magento Platform project is a single repository comprising three distinct, mutually reinforcing parts.

* `module` is the platform specific code that must be deployed to the platform in order for the NS8 Protect integration to become available for integration. For production, the contents of this folder will be assembled in a zip file and deployed to the Magento Marketplace where it will be available to install into individual vendor stores. For development, the entire contents of this folder will be copied to an instance of Magento running in a container. In both cases, the installation of the module is executed via composer (a PHP convention, similar to npm or yarn in some respects).
* `switchboard` is the deployment configuration of the lamba functions, the metadata of the functions, specifically tailored to bundle the contents of `switchboard/switches` for deployment to AWS's Step function utility.
* `switchboard/switches` contains the lambda definitions--that is, the functions themselves, and any additional business logic required to execute those methods.

## IDE

While any IDE can work, VS Code has a number of extensions that make it well suited for Magento development.

NOTE: some VSCode settings are stored in [VCS](https://github.com/ns8inc/ns8-magento-platform/blob/master/.vscode/settings.json). Be sure when you modify settings that you do so at your local environment level and not at the project level. If you need to modify project level settings, make sure the team approves before committing. All of the following recommended extensions are part of the project and will be recommended when first opening the project in VS Code.

* Install [VS Code](https://code.visualstudio.com)
* *Highly* Recommended Extensions ([these should be recommended automatically inside VS Code](https://github.com/ns8inc/ns8-magento-platform/blob/master/.vscode/extensions.json))
  * [PHP Debug extension](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-debug)
  * [Remote Development extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
  * [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
  * [PHP DocBlocker](https://marketplace.visualstudio.com/items?itemName=neilbrayfield.php-docblocker)
  * [PHP IntelliSense](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense)
    * This requires that PHP be in your path. You can also set it inside `settings.json` in VS Code by defining: `"php.executablePath": "<your path to php>"`
  * [PHP CodeSniffer](https://marketplace.visualstudio.com/items?itemName=ikappas.phpcs)
    * This requires `phpcs` to be installed, which you can do by following the instructions in the extension
  * [PHP CodeSniffer Fixer](https://marketplace.visualstudio.com/items?itemName=junstyle.php-cs-fixer)
    * Update these values in `settings.json`: `"php.validate.executablePath": "<your path to php>",`

NOTE: both `phpcs` and `php cs fixer` must share the same rule set! We use `PSR2` for now.
These values should already be set at your project level:

```bash
"php.suggest.basic": false
"phpcs.standard": "PSR2"
"php-cs-fixer.rules": "@PSR2"
```

### IDE Resources

* <https://andy-carter.com/blog/essential-visual-studio-code-extensions-for-php-developers>

## Switchboard Development

The magento platform repository is split into 2 projects. Switchboard logic lives in `switchboard`. `switchboard` defines each of the lambda functions that will be executed on the remote, server-less infrastructure.

The magento-platform project defines outer level build and compile tasks. One should always start at the repo level and `yarn build` or `yarn build:dev` accordingly to compile the entire project.

General flow:

* `$ yarn build:dev`
* `$ yarn deploy --stage={devName}` (this will deploy to AWS using your devName as a unique prefix

### Getting in a new switch

Create xSwitch.ts
Set breakpoints in the Switchboard controller inside executeSwitchboard function
Implement ISwitchContext
export class
export * from class in index.ts

### switchboard project

add switch to serverless.yml
add switch to app.ts

## Debugging PHP

* package.json (node) has `start:debug` task
* start that
* then, in vs code, hit start `Attach to process` task

* VS Code: ensure php debug extension on remote server
* manually copy .vscode folder to server
* technically only need the "Listen for XDebug" task in launch.json

Step functions live in the Oregon region. Go to <https://us-west-2.console.aws.amazon.com/states/home?region=us-west-2#/statemachines>

## Testing end-to-end

* Comes with 2 orders by default
* Fastest way to generate order change seems to be Reorder
* Open the Magento, admin panel, go to Sales, View the order, click Reorder
* Manually specify payment option (check/money order)
* If you've added a breakpoint in OrderUpdate.php, you can step through
* Step through quickly or you will get timed OrderUpdate

* Use ns8-magento2-rest-client to make calls to get orders
* `switchboard` project are linked through

### Add a payment method

To add credit card payments

* Go to authorize.net and create a new account
* Add it to Magento by going to Admin Panel -> Stores -> Configuration -> Payment Methods
* Authorize.net to test CC transactions
* Link in their wiki with dummy card numbers and how to use
