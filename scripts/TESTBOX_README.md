# Testbox

`testbox` is a bash CLI meant to automate the setup process of a public-facing, developer-independent instance of Magento hosting an NS8 Protect app for the purposes of QA. 

# Pre-requisites

+ you have the `aws` cli and have been added to the AWS group [see the docs here](https://internal-dev-docs.readme.io/docs/aws)
+ you are connected to the NS8 ngrok account [see the docs here](https://internal-dev-docs.readme.io/docs/ngrok)
+ You have created a lightsail instance and gone through the instance configuration steps [outlined here](https://internal-dev-docs.readme.io/docs/aws-lightsail#section-instance-config)

## Usage

- clone `ns8-magento-platform` repo
- rsync `ns8-magento-platform/scripts/testbox` to your lightsail instance
- ssh to your lightsail instance and run `chmod +x testbox`
- Run `init` to setup your Linux dependencies
- Run `configure` to authenticate and initialize your aws, ngrok, npm login, and magento developer information
- Run `pull` to clone the ns8-protect and ns8-magento repos
- Run `build` to install, configure and run those app servers in the background

## Commands

This is the same as `magento/scripts/lightsail-setup.sh`, integrated into this CLI.

### configure

This is the only manual aspect to testbox.  Takes you through:
    + configuring your Magento OAuth email and callback/identity urls
    + ngrok setup
    + aws setup
    + npm login
    + ssh key generation

### pull 

Pull a fresh copy of the `ns8-protect-api`, `ns8-protect-client` and `ns8-magento-platform` repos. Optionally, you can specify a branch and commit hash for each repo when you clone it from the NS8 github.  

### build

Install each repo, and run the api and client, as well as the magento build script.
