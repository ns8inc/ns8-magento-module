# Configuring Lightsail for Magento

## Access and Permissions

Lightsail is a cloud VM solution hosted on AWS. AWS access is linked to SSO. Open `All Apps` from the Office 365 online menu and select AWS.

* Verify you can access the Light Sail instances

> If you don't have Lightsail access, contact David Hansen for a permissions update.

## Instance Config

* Create a new Instance
* Select `Linux/Unix`
* Select `OS Only`
* Select `Amazon Linux`
* Select `Add Launch Script`
* Open the [lightsail-setup.sh](https://github.com/ns8inc/ns8-magento-platform/blob/master/scripts/lightsail-setup.sh) script
  * Edit the three variables at the top with your environment details:
    * `NS8_PROTECT_URL=` -> enter your protect API URL, e.g. http://johndoe-local-api.ngrok.io
    * `NS8_CLIENT_URL=` -> enter your protect CLIENT URL, e.g. http://johndoe-local-protect.ngrok.io
    * `DEV_LIGHTSAIL_DOMAIN=` -> enter your dev URL, e.g. http://johndoe.ns8demos.com/
  * Paste the contents into the Light Sail script form
* Select either the $20 or $40 plan
* Add a unique name to identify your instance, e.g. `dev-johndoe`
* Click `Create Instance`
* Wait approximately 30-45 minutes for the install to complete
  * To view the output of the install script, ssh through the browser to your instance and run `tail -f /var/log/cloud-init-output.log`.

* While waiting, skip ahead to `Assign a Static IP Address`, complete those steps and then return
* Confirm that you can connect to the instance in a browser

## Assign a Static IP Address

* Go to [Networking](https://lightsail.aws.amazon.com/ls/webapp/home/networking) in Light Sail
* Create a new static IP address in the same region as your container and name it e.g. `John.Doe`
* Attach the IP address to your container
* Go to [Route 53](https://console.aws.amazon.com/route53/home)
* Create a record set in the ns8demos.com hosted zone that matches your `DEV_LIGHTSAIL_DOMAIN` and point its A record to your new static IP address
* You may not have permission to view/edit Route 53.  If this is the case, ask your team lead for assistance.

# Manual Instance Config

Additional steps are required in order to have a fully functioning dev environment.


## Set a password for `ec2-user`

[Amazon Guide here](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-password-login/)

* SSH through the browser to your instance
* Set a password for the `ec2-user`
  * `$ sudo passwd ec2-user`
  * Enter and confirm the new password (remember to store that somewhere for future reference)

You should now be able to use any SFTP client to connect to the lightsail instance

* Download the [SSH certificate](https://lightsail.aws.amazon.com/ls/webapp/account/keys) for your Light Sail instance. This should be named something like `LightsailDefaultKey-us-east-1.pem`.
* Place the `.pem` file in your `/user/.ssh` folder
* If you get an error: ```
Permissions 0644 for '/<path to your user directory>/.ssh/<key>.pem' are too open.```
then you need to modify the permissions on the .pem file.  Run sudo chmod 600 <key file>

* Edit your `/user/.ssh/config` file (or create one if missing) with the entry for your Light Sail instance
```
Host <ip-address>
    User ec2-user
    HostName <ip-address>
    IdentityFile ~/.ssh/LightsailDefaultKey-us-east-1.pem
```
* You should now be able to connect via SSH to Light Sail through VS Code

# Remote Development

## Configuration

Some server configuration is done via Environment Variables. You may have already set them if you started recently. If not, you should ensure that the variables are set correctly:

* Check that the .htaccess file sets the correct environment variables by running `$ cat /var/www/html/.htaccess`
  - You should see a line like: `SetEnv NS8_PROTECT_URL http://<your-dev-space>.ngrok.io/`.  If you don't, then run: `$ echo "SetEnv NS8_PROTECT_URL http://<your-dev-space>.ngrok.io/" | sudo tee -a /var/www/html/.htaccess`
  - You should also a line like: `SetEnv NS8_CLIENT_URL http://<your-dev-space>.ngrok.io/`.  If you don't, then run: `$ echo "SetEnv NS8_CLIENT_URL http://<your-dev-space>.ngrok.io/" | sudo tee -a /var/www/html/.htaccess`
* Restart: `$ sudo service httpd restart`

## Magento extension file structure

* In development and test, the extension will live in `/var/www/html/app/code/NS8/Protect`
* In production environments, the extension will live in `/var/www/html/vendor/NS8/Protect`

## Building NS8 Protect and syncing with our deployed instance

Next, we want to build the NS8 Protect App ("Extension" in Magento terms) & deploy it to our test instance. The following steps assume you have installed some method of keeping your remote code in sync with the local code. This is discussed in greater detail in the [Working with files](#section-working-with-files) section.

* Locally, navigate to `ns8-magento-platform/build/module/etc/integration/config.dev.xml`
* Replace hardcoded information in `endpoint_url` & `identity_link_url` to correspond with your ngrok URL for `ns8-protect-api`. Be sure to leave the existing paths. Example:

```xml
<integrations>
   <integration name="NS8 Integration">
       <email>patrick.allen@ns8.com</email>
       <endpoint_url>http://patrick-local-api.ngrok.io/protect/magento/callback</endpoint_url>
       <identity_link_url>http://patrick-local-api.ngrok.io/protect/magento/identity</identity_link_url>
   </integration>
</integrations>
```

* From the project root, run `yarn build:dev`
* Execute your syncing tool's command to sync up the `ns8-magento-platform/modules` directory with your deployed instance
* SSH into your deployed instance or access it by whatever means you have established
* From `/var/www/html`, run `sudo php bin/magento setup:upgrade && sudo php bin/magento cache:clean`

> Note: There can sometimes be an issue with the `yarn build:dev` step. If you receive cryptic errors regarding a failed dependency reference, try nuking your temporary directories and trying again. This will become a less manual process when the scripts provide an avenue to clear all existing generated data.

## Finish app install in the Magento Dashboard

* Go to `http://{{YOUR_INSTANCE_ADDRESS}}/index.php/admin_demo` to login to the Admin Dashboard.

> Account password is found in the [Lightsail script file](https://github.com/ns8inc/ns8-magento-platform/blob/master/scripts/lightsail-setup.sh#L94).

* Once logged in, use the icons on the left to navigate to `System > Extensions > Integrations`. Image below provides some guidance.
