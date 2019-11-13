<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\UpgradeSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use NS8\Protect\Helper\Setup;

/**
 * Upgrade the Protect data model whenever the extension is updated
 */
class UpgradeSchema implements UpgradeSchemaInterface
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
    public function upgrade(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->setupHelper->upgradeSchema('upgrade', $setup, $context);
    }
}
