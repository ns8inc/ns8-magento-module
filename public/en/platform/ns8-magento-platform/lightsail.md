# Configuring Lightsail for Magento

Lightsail is a cloud VM solution hosted on AWS. AWS access is linked to SSO. Open `All Apps` from the Office 365 online menu and select AWS.

* Verify you can access the Light Sail instances

> If you don't have Lightsail access, contact your TL or PM for a permissions update.

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

## Manual Instance Config

Additional steps are required in order to have a fully functioning dev environment.

### Set a password for `ec2-user`

[Amazon Guide here](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-password-login/)

* SSH through the browser to your instance
* Set a password for the `ec2-user`
  * `$ sudo passwd ec2-user`
  * Enter and confirm the new password (remember to store that somewhere for future reference)

You should now be able to use any SFTP client to connect to the lightsail instance

* Download the [SSH certificate](https://lightsail.aws.amazon.com/ls/webapp/account/keys) for your Light Sail instance. This should be named something like `LightsailDefaultKey-us-east-1.pem`.
* Place the `.pem` file in your `/user/.ssh` folder
* If you get an error: `Permissions 0644 for '/<path to your user directory>/.ssh/<key>.pem' are too open.` then you need to modify the permissions on the .pem file.  Run sudo chmod 600 `{key file}`

* Edit your `/user/.ssh/config` file (or create one if missing) with the entry for your Light Sail instance

  ```bash
  Host <ip-address>
      User ec2-user
      HostName <ip-address>
      IdentityFile ~/.ssh/LightsailDefaultKey-us-east-1.pem
  ```

* You should now be able to connect via SSH to Light Sail through VS Code

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

```bash
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
