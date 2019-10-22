<?php
namespace NS8\CSP2\Setup;

use Magento\Framework\Setup\UpgradeDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\CSP2\Helper\CustomStatus;

class UpgradeData implements UpgradeDataInterface
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
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->customStatus->setCustomStatuses('Running Data Upgrade');
    }
}
