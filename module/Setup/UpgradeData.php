<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\UpgradeDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\CustomStatus;

class UpgradeData implements UpgradeDataInterface
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
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->customStatus->setCustomStatuses('Running Data Upgrade');
        $this->integrationManager->processIntegrationConfig([Config::NS8_INTEGRATION_NAME]);
    }
}
