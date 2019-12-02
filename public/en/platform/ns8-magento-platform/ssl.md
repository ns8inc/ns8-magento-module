# Configuring Magento for SSL

This guide should enable a Magento instance running on Amazon Linux 1 on Lightsail to use SSL

* Login to Lightsail
* Enable port 443 on the Networking tab of your instance
* Update Linux to latest: `$ sudo yum update -y`
* Install `mod_ssl`: `$ sudo yum install -y mod24_ssl`
* Install Certbot:
  * `$ sudo yum-config-manager --enable epel`
  * `$ wget https://dl.eff.org/certbot-auto`
  * `$ sudo mv certbot-auto /usr/local/bin/certbot-auto`
  * `$ sudo chown root /usr/local/bin/certbot-auto`
  * `$ sudo chmod 0755 /usr/local/bin/certbot-auto`
* Configure a VirtualHost in Apache
  * Edit the main Apache configuration file, `/etc/httpd/conf/httpd.conf`. Locate the "Listen 80" directive and add the following lines after it, replacing the example domain names with the actual Common Name and Subject Alternative Name (SAN).

  ```bash
  <VirtualHost *:80>
    DocumentRoot "/var/www/html"
    ServerName "example.com"
    ServerAlias "www.example.com"
  </VirtualHost>
  ```

* Create the certificate
  * `$ sudo /usr/local/bin/certbot-auto --apache --debug`
  * Optionally, follow the steps to setup autorenewal: <https://certbot.eff.org/lets-encrypt/centosrhel8-apache>
* Configure Magento to use SSL
  * `$ sudo bin/magento setup:store-config:set --use-secure-admin=1`
  * `$ sudo bin/magento setup:store-config:set --use-secure=1`
  * `$ sudo bin/magento setup:store-config:set --base-url-secure=https://example.com`
* Restart Apache
  * `$ sudo service httpd restart`

## Resources

* <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-ami.html>
* <https://certbot.eff.org/lets-encrypt/centosrhel8-apache>
* <https://devdocs.magento.com/guides/v2.3/install-gde/install/cli/install-cli-subcommands-store.html>
* <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html>
