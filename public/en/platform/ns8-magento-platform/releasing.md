# Releasing

In order to manually release a new version, follow these steps.

* Set your ENV variable `NODE_ENV` to `prod`
* Run `$ yarn version:patch`
* Switch to the `switches` project and run `$ yarn deploy --stage=test`
* If you do not already have it, clone `git@github.com:ns8inc/ns8-magento-module.git`
* Copy the contents of the `module` directory into `ns8-magento-module`
* Commit the changes to `ns8-magento-module`
  * Verify that the `etc/integration/config.xml` file's URLs correctly target production
  * Push the changes.
  * Tag the repo with the latest version, e.g. `v2.0.22`
  * Push the tag
* Commit the `ns8-magento-platform` changes on a new branch
* Create a PR for the version bump
* Once the PR is merged, switch to master and pull latest
* Tag master with the latest version
* Push the tag
