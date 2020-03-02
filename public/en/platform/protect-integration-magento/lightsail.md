# Configuring Lightsail for Magento

1. [Configuring Lightsail for Magento](#configuring-lightsail-for-magento)
   1. [Instance Config](#instance-config)
   1. [Assign a Static IP Address](#assign-a-static-ip-address)
   1. [Manual Instance Config](#manual-instance-config)
      1. [Setup SSH Access](#setup-ssh-access)
   1. [Remote Development](#remote-development)
      1. [Configuration](#configuration)
      1. [Magento extension file structure](#magento-extension-file-structure)
   1. [Configure Magento for Debugging](#configure-magento-for-debugging)
   1. [Xdebug](#xdebug)

Lightsail is a cloud VM solution hosted on AWS. AWS access is linked to SSO. Open `All Apps` from the Office 365 online menu and select AWS.

* Verify you can access the Lightsail instances

> If you don't have Lightsail access, contact your TL or PM for a permissions update.

## Instance Config

* Create a new Instance
* Select `Linux/Unix`
* Select `OS Only`
* Select `Amazon Linux`
* Select `Add Launch Script`
* Open the [lightsail-setup.sh](https://github.com/ns8inc/protect-integration-magento/blob/master/scripts/lightsail-setup.sh) script
  * Edit the four variables at the top with your environment details:
    * `NS8_PROTECT_URL=` -> enter your protect API URL, e.g. http://johndoe-local-api.ngrok.io
    * `NS8_CLIENT_URL=` -> enter your protect CLIENT URL, e.g. http://johndoe-local-protect.ngrok.io
    * `DEV_LIGHTSAIL_DOMAIN=` -> enter your dev URL, e.g. http://johndoe.ns8demos.com/
    * `SSH_PASSWORD` -> The ssh password that you want for the ec2-user account
  * Paste the contents into the Lightsail script form
* Select either the $20 or $40 plan
* Add a unique name to identify your instance, e.g. `dev-johndoe`
* Click `Create Instance`
* Wait approximately 10-15 minutes for the install to complete
  * To view the output of the install script, ssh through the browser to your instance and run `tail -f /var/log/cloud-init-output.log`.
  * Note that the AWS console's built-in ssh client will disconnect once the script finishes (because the ssh port moves to TCP 65422).

* While waiting, skip ahead to `Assign a Static IP Address`, complete those steps and then return
* Confirm that you can connect to the instance in a browser

## Assign a Static IP Address

* Go to [Networking](https://lightsail.aws.amazon.com/ls/webapp/home/networking) in Lightsail
* Create a new static IP address in the same region as your container and name it e.g. `John.Doe`
* Attach the IP address to your container
* Go to [Route 53](https://console.aws.amazon.com/route53/home)
* Create a record set in the ns8demos.com hosted zone that matches your `DEV_LIGHTSAIL_DOMAIN` and point its A record to your new static IP address
* You may not have permission to view/edit Route 53.  If this is the case, ask your team lead for assistance.


## Manual Instance Config

Additional steps are required in order to have a fully functioning dev environment.

### Setup SSH Access

* Go to your instance in Lightsail and click on the `Networking` tab
* Under `Firewall`, click `Edit Rules`
* Remove the `SSH` rule (TCP port 22)
* Add a `Custom` rule (TCP port 65422)
* Click `Save`

You should now be able to use any SFTP client to connect to the lightsail instance on port 65422.

* Download the [SSH certificate](https://lightsail.aws.amazon.com/ls/webapp/account/keys) for your Lightsail instance. This should be named something like `LightsailDefaultKey-us-east-1.pem`.
* Place the `.pem` file in your `/user/.ssh` folder
* If you get an error: `Permissions 0644 for '/<path to your user directory>/.ssh/<key>.pem' are too open.` then you need to modify the permissions on the .pem file.  Run sudo chmod 600 `{key file}`

* Edit your `/user/.ssh/config` file (or create one if missing) with the entry for your Lightsail instance

  ```bash
  Host <ip-address>
      User ec2-user
      HostName <ip-address>
      IdentityFile ~/.ssh/LightsailDefaultKey-us-east-1.pem
      Port 65422
  ```

* You should now be able to connect via SSH to Lightsail through VS Code.

## Remote Development

### Configuration

Some server configuration is done via Environment Variables. You may have already set them if you started recently. If not, you should ensure that the variables are set correctly:

* Check that the .htaccess file sets the correct environment variables by running `$ cat /var/www/html/.htaccess`
  * You should see a line like: `SetEnv NS8_PROTECT_URL http://<your-dev-space>.ngrok.io/`.  If you don't, then run: `$ echo "SetEnv NS8_PROTECT_URL http://<your-dev-space>.ngrok.io/" | sudo tee -a /var/www/html/.htaccess`
  * You should also a line like: `SetEnv NS8_CLIENT_URL http://<your-dev-space>.ngrok.io/`.  If you don't, then run: `$ echo "SetEnv NS8_CLIENT_URL http://<your-dev-space>.ngrok.io/" | sudo tee -a /var/www/html/.htaccess`
* Restart: `$ sudo service httpd restart`

### Magento extension file structure

* In development and test, the extension will live in `/var/www/html/app/code/NS8/Protect`
* In production environments, the extension will live in `/var/www/html/vendor/NS8/Protect`

## Configure Magento for Debugging

Magento install lives under `/var/www/html/`

* Enable Magento Development Mode
  * `$ php bin/magento deploy:mode:set developer`
* Enable PHP Display Errors
  * Open `app/bootstrap.php`
  * Uncomment the line `ini_set('display_errors', 1);`
* Enable Magento 2 Display Errors
  * Rename `pub/errors/local.xml.sample` > `/pub/errors/local.xml`
* Enable Template Path Hints
  * Open <http://your_subdomain.ns8demos.com/index.php/admin_demo>
  * Click Stores > Configuration > Advanced > Developer > Debug
  * Enable all options

## Xdebug

* Install pecl
  * `$ sudo yum -y install php7-pear php71-devel gcc`
  * `$ sudo pecl7 channel-update pecl.php.net`
* `$ sudo pecl7 install xdebug`
* Edit `/etc/php.ini`
  * Add

```ini
[xdebug]
zend_extension=/usr/lib64/php/7.1/modules/xdebug.so
xdebug.remote_enable = 1
xdebug.remote_port = 9000
xdebug.remote_autostart = 1
xdebug.remote_host = 127.0.0.1
xdebug.remote_connect_back = 0
```

* Verify that xdebug is loaded
  * `$ php --version`
  * Expect output: "PHP 7.0.33 (cli) (built: Jan  9 2019 22:04:26) ... with Xdebug v2.7.2..."
