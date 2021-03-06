<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\UpgradeDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\Protect\Helper\Setup;

/**
 * Upgrade the Protect data model whenever the extension is updated
 */
class UpgradeData implements UpgradeDataInterface
{
    /**
     * @var Setup
     */
    protected $setupHelper;

    /**
     * @param Setup $setupHelper
     */
    public function __construct(
        Setup $setupHelper
    ) {
        $this->setupHelper = $setupHelper;
    }

    /**
     * {@inheritdoc}
     */
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->setupHelper->upgradeData('upgrade', $setup, $context);
    }
}
