<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use NS8\Protect\Helper\Setup;

/**
 * Install the Protect data model extensions on first install
 */
class InstallSchema implements InstallSchemaInterface
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
    public function install(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->setupHelper->upgradeSchema('install', $setup, $context);
    }
}
