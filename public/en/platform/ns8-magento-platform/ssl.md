# Configuring Magento for SSL

This guide should enable a Magento instance running on Amazon Linux 1 on Lightsail to use SSL

* Login to Lightsail
* Enable port 443 on the Networking tab of your instance
* Create the certificate and configure Magento use SSL
  * If your Lightsail instance was initialized without the `ssl_cert_prep.sh` script:
    * From the `ns8-magento-platform` project root run:
    * `npm run certbot:prep`
  * From the `ns8-magento-platform` project root run:
  * `npm run certbot`
* Optionally, follow the steps to setup autorenewal: <https://certbot.eff.org/lets-encrypt/centosrhel8-apache>

## Resources

* <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-ami.html>
* <https://certbot.eff.org/lets-encrypt/centosrhel8-apache>
* <https://devdocs.magento.com/guides/v2.3/install-gde/install/cli/install-cli-subcommands-store.html>
* <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html>
