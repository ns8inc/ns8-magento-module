<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\Protect\Helper\Setup;

/**
 * Install the Protect data model extensions on first install
 */
class InstallData implements InstallDataInterface
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
    public function install(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->setupHelper->upgradeData('install', $setup, $context);
    }
}
