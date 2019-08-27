<?php
 namespace NS8\CSP2\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use Magento\Framework\Setup\UpgradeDataInterface;

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
    public function __construct(ConfigBasedIntegrationManager $integrationManager, \Psr\Log\LoggerInterface $logger)
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
