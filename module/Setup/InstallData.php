<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\Protect\Helper\Upgrade;

/**
 * Install the Protect data model extensions on first install
 */
class InstallData implements InstallDataInterface
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
    public function install(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->upgradeHelper->upgrade('install', $setup, $context);
    }
}
