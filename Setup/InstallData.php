<?php
namespace NS8\CSP2\Setup;

use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use NS8\CSP2\Helper\Config;
use NS8\CSP2\Helper\CustomStatus;

class InstallData implements InstallDataInterface
{
    /**
     * @var CustomStatus
     */
    protected $customStatus;

    /**
     * @var ConfigBasedIntegrationManager
     */
    protected $integrationManager;

    /**
     * @param ConfigBasedIntegrationManager $integrationManager
     * @param CustomStatus $customStatus
     */
    public function __construct(
        ConfigBasedIntegrationManager $integrationManager,
        CustomStatus $customStatus
    ) {
        $this->customStatus = $customStatus;
        $this->integrationManager = $integrationManager;
    }
    /**
     * {@inheritdoc}
     */
    public function install(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->customStatus->setCustomStatuses('Running Data Install');
        $this->integrationManager->processIntegrationConfig([Config::NS8_INTEGRATION_NAME]);
    }
}
