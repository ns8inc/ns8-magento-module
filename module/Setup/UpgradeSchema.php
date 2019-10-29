<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\UpgradeSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\DB\Ddl\Table;

class UpgradeSchema implements UpgradeSchemaInterface
{
    public function __construct()
    {
    }

    public function upgrade(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
    }
}
