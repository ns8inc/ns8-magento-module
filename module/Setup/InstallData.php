<?php
namespace NS8\CSP2\Setup;

use Exception;
use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use NS8\CSP2\Helper\CustomStatus;

class InstallData implements InstallDataInterface
{
    protected $customStatus;

    /**
     * @param CustomStatus $customStatus
     */
    public function __construct(
        CustomStatus $customStatus
    ) {
        $this->customStatus = $customStatus;
    }
    /**
     * {@inheritdoc}
     */
    public function install(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $this->customStatus->setCustomStatuses('Running Data Install');
    }
}
