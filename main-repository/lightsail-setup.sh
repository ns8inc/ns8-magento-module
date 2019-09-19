#### Use with 'Launch Script' when creating instance in AWS LightSail

## Set Variables!! You MUST set these!!

# http://<YOUR DEV URL>.ngrok.io, e.g. http://dev-jdoe-magento.ngrok.io
NS8_PROTECT_URL=
# http://<YOUR NS8 PROTECT CLIENT APP DEV URL>.ngrok.io, e.g. https://david-local-protect.ngrok.io/#
NS8_CLIENT_URL=
# <YOUR DEV DOMAIN>, e.g. http://dev-jdoe-Magento-2.3.2.ns8demos.com/
DEV_LIGHTSAIL_DOMAIN=
# Any valid access token
DEV_ACCESS_TOKEN=ee411d1d-7ca1-4a45-90d8-5011f55430d9

## BEGIN--SCRIPT ##
# Magento
​
# Create SWAP file; 2GB
dd if=/dev/zero of=/swapfile bs=1M count=2048
mkswap /swapfile
chmod 600 /swapfile
swapon /swapfile
echo "swap /swapfile swap defaults 0 0" | sudo tee -a /etc/fstab

# Add nodejs repository
curl -sL https://rpm.nodesource.com/setup_10.x | sudo -E bash -
​
# Update packages
yum update -y
​
# Install LAMP
yum install -y \
git \
httpd24 \
nodejs \
php71 \
php71-bcmath \
php71-gd \
php71-intl \
php71-mbstring \
php71-mcrypt \
php71-mysqlnd \
php71-soap \
php71-zip \
mysql57-server
​
# Configure Web and DB servers to start on boot
chkconfig httpd on
chkconfig mysqld on
​
# Change PHP memory limit // Magento wants 2GB,
sed -i 's/memory_limit = 128M/memory_limit = 2048M/g' /etc/php-*.ini
​
# Change Apache to allow Overrides
sed -i '151s/None/All/' /etc/httpd/conf/httpd.conf
​
# Set Composer path
echo "COMPOSER_HOME=/var/www/html/var/composer_home" | sudo tee -a /etc/environment
# Set NS8_PROTECT_URL environment variable
echo "SetEnv NS8_CLIENT_URL $NS8_CLIENT_URL" | sudo tee -a /var/www/html/.htaccess
echo "SetEnv NS8_PROTECT_URL $NS8_PROTECT_URL" | sudo tee -a /var/www/html/.htaccess
# Set DEV_ACCESS_TOKEN
#echo "SetEnv DEV_ACCESS_TOKEN $DEV_ACCESS_TOKEN" | sudo tee -a /var/www/html/.htaccess

# Set file permissions (Force the group apache on all files and give RWX permissions)
chown -R apache:apache /var/www/html
chmod -R 2775 /var/www/html
setfacl -Rdm g:apache:rwx /var/www/html
​
# Start Web and DB server
service httpd start
service mysqld start
​
# Create database
mysql -u root -e "CREATE DATABASE magento2"
mysql -u root -e "CREATE USER 'magento_db_user'@'localhost' IDENTIFIED BY 'magento_db_password'"
mysql -u root -e "GRANT ALL PRIVILEGES ON magento2.* TO 'magento_db_user'@'localhost'"
mysql -u root -e "FLUSH PRIVILEGES"

## Mage ID
# MAG005397149
## Mage Token
# 2f7e27231024a6cbc3e075f5a74b8264e6badb56
## List all file versions
#curl -k https://MAG005397149:2f7e27231024a6cbc3e075f5a74b8264e6badb56@www.magentocommerce.com/products/downloads/info/versions
​
# Download installer
# With sample data
#cd /var/www && curl -O https://MAG005397149:2f7e27231024a6cbc3e075f5a74b8264e6badb56@www.magentocommerce.com/products/downloads/file/Magento-CE-2.2.5_sample_data.zip
#cd /var/www && curl -O https://MAG005397149:2f7e27231024a6cbc3e075f5a74b8264e6badb56@www.magentocommerce.com/products/downloads/file/Magento-CE-2.3.1_sample_data.zip
cd /var/www && curl -O https://MAG005397149:2f7e27231024a6cbc3e075f5a74b8264e6badb56@www.magentocommerce.com/products/downloads/file/Magento-CE-2.3.2_sample_data.zip
# WithOUT sample data
#cd ~ && curl -O https://MAG005397149:2f7e27231024a6cbc3e075f5a74b8264e6badb56@www.magentocommerce.com/products/downloads/file/Magento-CE-2.3.2.zip
​
​
# Unzip Magento files to web root
sudo -u apache unzip -qq /var/www/Magento-* -d /var/www/html
​
# Install Magento via CLI
# NOTE: You MUST modify `base-url` to point to your own subdomain
sudo -u apache php /var/www/html/bin/magento setup:install \
--language=en_US \
--timezone=America/Los_Angeles \
--db-name=magento2 \
--db-user=magento_db_user \
--db-password=magento_db_password \
--backend-frontname=admin_demo \
--admin-firstname=Development \
--admin-lastname=Testing \
--admin-email=dev@ns8demos.com \
--admin-user=development \
--admin-password=YzbLenbGRGN6fxqNsz.ti \
--base-url=$DEV_LIGHTSAIL_DOMAIN
​
​
# Setup Magento CRON jobs
sudo -u apache php /var/www/html/bin/magento cron:install
​
# Set Magento Admin password to not expire
sudo -u apache php /var/www/html/bin/magento config:set admin/security/password_lifetime 0
sudo -u apache php /var/www/html/bin/magento cache:clean
​
​
# Update Composer Auth
sudo -u apache cp /var/www/html/auth.json.sample /var/www/html/auth.json
#### Need to remove git section
## remove lines with 'github*'
## remove lines with '},'
## OR remove line with 'github-oauth' and the following 2 lines (3 lines in total)
sed -i '/github/d' /var/www/html/auth.json
sed -i '/},$/d' /var/www/html/auth.json
sed -i 's/<public-key>/1b8325eb6d792fe22c0fb83f65150281/' /var/www/html/auth.json
sed -i 's/<private-key>/d68ff7618b2f3118a0342d7f914848c8/' /var/www/html/auth.json
​
# Add Protect (CSP) Module
# cd /var/www/html
## Following command will run php with no memory limit (not necessary if set high enough in a php.ini file)
#sudo -u apache php -d memory_limit=-1 /var/www/html/vendor/composer/composer/bin/composer require ns8/csp
​
#Create the directory where we will test the CSP2 extension
sudo -u apache mkdir -p /var/www/html/app/code/NS8/CSP2

#Make the magento command executable
sudo chmod +x /var/www/html/bin/magento

## The following 3 lines will (eventually) install CSP2 via the Magento Marketplace
#sudo -u apache php /var/www/html/vendor/composer/composer/bin/composer require ns8/csp2
#sudo -u apache php /var/www/html/bin/magento module:enable NS8_CSP2
#sudo -u apache php /var/www/html/bin/magento setup:upgrade
​
## The following lines will (eventually) download and install a Magento Module manually
# sudo -u apache wget -O /var/www/html/app/ns8-module.zip https://ns8.s3.amazonaws.com/builds/TBD
# This assumes the module root is at the root of the zip file. If they are in a subfolder, you'll need to handle that
# sudo -u apache unzip /var/www/html/app/ns8-module.zip -d /var/www/html/app/code/NS8/CSP2
# sudo -u apache php /var/www/html/bin/magento setup:upgrade
# rm /var/www/html/app/ns8-module.zip
​
# Remove Composer Auth
#rm /var/www/html/auth.json.sample
#rm /var/www/html/auth.json
​
## END--SCRIPT ##
