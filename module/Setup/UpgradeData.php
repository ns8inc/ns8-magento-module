<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\UpgradeDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\Protect\Helper\Upgrade;

/**
 * Upgrade the Protect data model whenever the extension is updated
 */
class UpgradeData implements UpgradeDataInterface
{
    /**
     * @var Upgrade
     */
    protected $upgradeHelper;

    /**
     * @param Upgrade $upgradeHelper
     */
    public function __construct(
        Upgrade $upgradeHelper
    ) {
        $this->upgradeHelper = $upgradeHelper;
    }

    /**
     * {@inheritdoc}
     */
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->upgradeHelper->upgrade('upgrade', $setup, $context);
    }
}
