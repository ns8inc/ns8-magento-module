<?php
namespace NS8\Protect\Helper;

use Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface;
use Magento\Eav\Setup\EavSetupFactory;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Integration\Model\ConfigBasedIntegrationManager;
use Magento\Sales\Model\ResourceModel\Order;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\CustomStatus;
use NS8\Protect\Helper\Logger;

class Upgrade extends AbstractHelper
{
    /**
     * @var CustomStatus
     */
    protected $customStatus;

    /**
     * @var EavSetupFactory
     */
    protected $eavSetupFactory;

    /**
     * @var ConfigBasedIntegrationManager
     */
    protected $integrationManager;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * @param ConfigBasedIntegrationManager $integrationManager
     * @param CustomStatus $customStatus
     * @param EavSetupFactory $eavSetupFactory
     * @param Logger $logger
     */
    public function __construct(
        ConfigBasedIntegrationManager $integrationManager,
        CustomStatus $customStatus,
        EavSetupFactory $eavSetupFactory,
        Logger $logger
    ) {
        $this->customStatus = $customStatus;
        $this->integrationManager = $integrationManager;
        $this->eavSetupFactory = $eavSetupFactory;
        $this->logger = $logger;
    }

    /**
     * Runs the install/upgrade logic
     *
     * @param string $mode
     * @param ModuleDataSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     */
    public function upgrade(string $mode, ModuleDataSetupInterface $setup, ModuleContextInterface $context) : void
    {
        try {
            $setup->startSetup();

            $this->customStatus->setCustomStatuses('Running Data '.$mode);
            $this->integrationManager->processIntegrationConfig([Config::NS8_INTEGRATION_NAME]);

            $eavSetup = $this->eavSetupFactory->create(['setup' => $setup]);

            $eavSetup->addAttribute(
                5,
                'eq8_score',
                [
                    'group' => 'Orders',
                    'type' => 'int',
                    'backend' => '',
                    'frontend' => '',
                    'label' => 'EQ8 Score',
                    'input' => 'boolean',
                    'class' => '',
                    'source' => 'Magento\Eav\Model\Entity\Attribute\Source\Boolean',
                    'global' => ScopedAttributeInterface::SCOPE_GLOBAL,
                    'visible' => true,
                    'required' => false,
                    'user_defined' => false,
                    'default' => '0',
                    'searchable' => true,
                    'filterable' => true,
                    'comparable' => true,
                    'visible_on_front' => false,
                    'used_in_product_listing' => false,
                    'unique' => false,
                    'apply_to' => ''
                ]
            );
            $eavSetup->addAttribute(
                'sales_order_grid',
                'eq8_score',
                [
                    'group' => 'Orders',
                    'type' => 'int',
                    'backend' => '',
                    'frontend' => '',
                    'label' => 'EQ8 Score',
                    'input' => 'boolean',
                    'class' => '',
                    'source' => 'Magento\Eav\Model\Entity\Attribute\Source\Boolean',
                    'global' => ScopedAttributeInterface::SCOPE_GLOBAL,
                    'visible' => true,
                    'required' => false,
                    'user_defined' => false,
                    'default' => '0',
                    'searchable' => true,
                    'filterable' => true,
                    'comparable' => true,
                    'visible_on_front' => false,
                    'used_in_product_listing' => false,
                    'unique' => false,
                    'apply_to' => ''
                ]
            );
        } catch (Exception $e) {
            $this->logger->error('Protect '.$mode.' failed', $e);
        } finally {
            $setup->endSetup();
        }
    }
}
