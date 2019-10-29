<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\CustomStatus;

class InstallData implements InstallDataInterface
{
    protected $customStatus;

    /**
     * @param CustomStatus $customStatus
     */
    public function __construct(
        CustomStatus $customStatus
    ) {
        $this->customStatus = $customStatus;
    }
    /**
     * {@inheritdoc}
     */
    public function install(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->customStatus->setCustomStatuses('Running Data Install');
    }
}
