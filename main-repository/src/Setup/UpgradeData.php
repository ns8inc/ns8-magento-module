<?php
 namespace NS8\CSP2\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use Magento\Integration\Model\Config;
use Magento\Framework\Setup\UpgradeDataInterface;
use NS8\CSP2\Helper\HttpClient;
use NS8\CSP2\Helper\Logger;

class UpgradeData implements UpgradeDataInterface
{
    protected $logger;
    /**
     * @var ConfigBasedIntegrationManager
     */
    private $integrationManager;
    /**
     * @param ConfigBasedIntegrationManager $integrationManager
     */
    public function __construct(ConfigBasedIntegrationManager $integrationManager, Logger $logger)
    {
        $this->integrationManager = $integrationManager;
        $this->logger = $logger;
    }
    /**
     * {@inheritdoc}
     */
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->logger->debug('Running Data Upgrade');
        $this->integrationManager->processIntegrationConfig(['testIntegration']);
    }
}
