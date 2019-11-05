<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\UpgradeDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\Protect\Helper\Upgrade;

class UpgradeData implements UpgradeDataInterface
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
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->upgrade('upgrade', $setup, $context);
    }
}
