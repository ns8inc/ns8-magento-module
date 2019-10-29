<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\DB\Ddl\Table;

class InstallSchema implements InstallSchemaInterface
{

    public function __construct()
    {
    }

    public function install(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
    }
}
