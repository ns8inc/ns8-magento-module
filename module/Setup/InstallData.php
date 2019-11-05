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
    protected $upgrade;

    /**
     * @param Upgrade $upgrade
     */
    public function __construct(
        Upgrade $upgrade
    ) {
        $this->upgrade = $upgrade;
    }

    /**
     * {@inheritdoc}
     */
    public function install(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->upgrade('install', $setup, $context);
    }
}
