Documentation on NS8 specific development for Magento.

# Overview

The Magento Platform project is a single repository comprising three distinct, mutually reinforcing parts.

* `module` is the platform specific code that must be deployed to the platform in order for the NS8 Protect integration to become available for integration. For production, the contents of this folder will be assembled in a zip file and deployed to the Magento Marketplace where it will be available to install into individual vendor stores. For development, the entire contents of this folder will be copied to an instance of Magento running in a container. In both cases, the installation of the module is executed via composer (a PHP convention, similar to npm or yarn in some respects).
* `switchboard` is the deployment configuration of the lamba functions, the metadata of the functions, specifically tailored to bundle the contents of `switches` for deployment to AWS's Step function utility.
* `switches` contains the lambda definitions--that is, the functions themselves, and any additional business logic required to execute those methods.

For general development, the project is designed to compile from the top down in order to provide universal TS compilation and linting. The `switchboard` and `switches` folders are also individual packages which can be deployed independent from the magento platform project.

# Local Development

## IDE

While any IDE can work, VS Code has a number of extensions that make it well suited for Magento development.

NOTE: some VSCode settings are stored in [VCS](https://github.com/ns8inc/ns8-magento-platform/blob/master/.vscode/settings.json). Be sure when you modify settings that you do so at your local environment level and not at the project level. If you need to modify project level settings, make sure the team approves before committing. All of the following recommended extensions are part of the project and will be recommended when first opening the project in VS Code.

* Install [VS Code](https://code.visualstudio.com)
* *Highly* Recommended Extensions ([these should be recommended automatically inside VS Code](https://github.com/ns8inc/ns8-magento-csp-module-v2/blob/master/.vscode/extensions.json))
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
```
"php.suggest.basic": false
"phpcs.standard": "PSR2"
"php-cs-fixer.rules": "@PSR2"
```

## Tools

* [Mockoon](https://mockoon.com) (zero-config mock web server)
  * To configure Mockoon, simply launch the app and define a GET and a POST route using wildcards. ![](https://user-images.githubusercontent.com/722761/63461444-a3f42a80-c426-11e9-91c3-48c94a0ebfff.png)
  * Then launch ngrok, `$ ngrok http -subdomain=<your-dev-api-name> 3000`

## Resources

* https://andy-carter.com/blog/essential-visual-studio-code-extensions-for-php-developers

# Switchboard Development

## Getting Started

The magento platform repository is split into 3 projects. Switchboard logic is divided between the `switchboard` and `switches` projects. `switchboard` is a skeleton project whose sole function is to bundle the step functions defined in the `switches` project and deploy that code to AWS Step functions. `switches` defines each of the lambda functions that will be executed on the remote, server-less infrastructure.

The magento-platform project defines outer level build and compile tasks. One should always start at the repo level and `yarn build` or `yarn build:dev` accordingly to compile the entire project. On success, in order to operate with the switch functions, switch project context (e.g. `$ cd switchboard`) for each project and compile them individually. Always start with switches and then proceed to switchboard.

General flow:

* `$ yarn build:dev`
* `$ cd switches`
* `$ yarn build:dev` (this will automatically create a yarn link for the switches project)
* `$ cd ..`
* `$ cd switchboard`
* `$ yarn build:dev` (this will automatically consume the above yarn link)
* `$ yarn deploy --stage={devName}` (this will deploy to AWS using your devName as a unique prefix

## Getting in a new switch

### switches project

Create xSwitch.ts
Set breakpoints in the Switchboard controller inside executeSwitchboard function
Implement ISwitchContext
export class
export * from class in index.ts

### switchboard project

add switch to serverless.yml
In ns8-magento2-switchboard/switchboard.json, change "link" to the version number you want to target
add switch to switchboard.json
add switch to app.ts

## Debugging PHP

- package.json (node) has `start:debug` task
- start that
- then, in vs code, hit start `Attach to process` task

- VS Code: ensure php debug extension on remote server
- manually copy .vscode folder to server
- technically only need the "Listen for XDebug" task in launch.json

- Switches project is where the actual step function logic lives
- Currently there is 1 switch: CreateOrderActionSwitch.ts
- Must implement the ISwitchContext interface (true?) (is that how the switches become functional?)

1. Make actual code changes in ns8-magento2-switches
2. Run "yarn build" in ns8-magento2-switches
3. Use ns8-magento2-switchboard to publish to AWS (everything in this repo is auto generated)

Step functions live in the Oregon region. Go to https://us-west-2.console.aws.amazon.com/states/home?region=us-west-2#/statemachines

## Testing end-to-end

- Comes with 2 orders by default
- Fastest way to generate order change seems to be Reorder
- Open the Magento, admin panel, go to Sales, View the order, click Reorder
- Manually specify payment option (check/money order)
- If you've added a breakpoint in OrderUpdate.php, you can step through
- Step through quickly or you will get timed OrderUpdate

- Use ns8-magento2-rest-client to make calls to get orders
- Switches and switchboard project are linked through

### Add a payment method

To add credit card payments

- Go to authorize.net and create a new account
- Add it to Magento by going to Admin Panel -> Stores -> Configuration -> Payment Methods
- Authorize.net to test CC transactions
- Link in their wiki with dummy card numbers and how to use
