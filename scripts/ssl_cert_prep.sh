#!/bin/bash

# Check for necessary environment variable
if [ "$DEV_LIGHTSAIL_DOMAIN" == "" ]
then
  echo "Please set the DEV_LIGHTSAIL_DOMAIN environment variable before running."
  echo "Example: DEV_LIGHTSAIL_DOMAIN=dev-jdoe-Magento-2.3.2.ns8demos.com"
  exit 1
fi

# Update yum packages
sudo yum update -y

# Install ssl mod
sudo yum install -y mod24_ssl

# Enable the Extra Packages for Enterprise Linux (EPEL) repository from the Fedora project
sudo yum-config-manager --enable epel

# Install Certbot
wget https://dl.eff.org/certbot-auto
sudo mv certbot-auto /usr/local/bin/certbot-auto
sudo chown root /usr/local/bin/certbot-auto
sudo chmod 0755 /usr/local/bin/certbot-auto

# Add VirtualHost for your domain
sudo sed -i "s/^Listen 80$/Listen 80\n<VirtualHost *:80>\n  ServerName $DEV_LIGHTSAIL_DOMAIN\n  DocumentRoot \"\/var\/www\/html\"\n<\/VirtualHost>/" /etc/httpd/conf/httpd.conf

# Configure Magento to use the https base url
sudo -u apache /var/www/html/bin/magento setup:store-config:set --base-url-secure=https://$DEV_LIGHTSAIL_DOMAIN/
sudo -u apache /var/www/html/bin/magento cache:clean

# Restart Apache
sudo service httpd restart
