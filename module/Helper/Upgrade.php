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

/**
 * Execute the install/upgrade logic for the Protect extension
 */
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
     * @param string $mode Should be "install" or "upgrade"
     * @param ModuleDataSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     */
    public function upgrade(string $mode, ModuleDataSetupInterface $setup, ModuleContextInterface $context) : void
    {
        try {
            //Essential step.
            $setup->startSetup();

            // Create or update our custom statuses using the current mode
            $this->customStatus->setCustomStatuses('Running Data '.$mode);
            // Run the base integration config method. This does not trigger activation.
            $this->integrationManager->processIntegrationConfig([Config::NS8_INTEGRATION_NAME]);
            // Prep to run EAV extension setup
            $eavSetup = $this->eavSetupFactory->create(['setup' => $setup]);
            $eavData = [
                'group' => 'Orders',
                'type' => 'int',
                'backend' => '', //TODO: verify this
                'frontend' => '', //TODO: verify this
                'label' => 'EQ8 Score',
                'input' => 'boolean', //TODO: verify this
                'class' => '', //TODO: verify this
                'source' => 'Magento\Eav\Model\Entity\Attribute\Source\Boolean', //TODO: verify this
                'global' => ScopedAttributeInterface::SCOPE_GLOBAL,
                'visible' => true,
                'required' => false,
                'user_defined' => false,
                'default' => 0,
                'searchable' => true,
                'filterable' => true,
                'comparable' => true,
                'visible_on_front' => false,
                'used_in_product_listing' => false,
                'unique' => false,
                'apply_to' => '' // TODO: verify this
            ];
            // Add an attribute to the Order model
            // NOTES:
            //   5 should equal etity_type_code="order" and entity_model="Magento\Sales\Model\ResourceModel\Order"
            $eavSetup->addAttribute(
                'order',
                'eq8_score',
                $eavData
            );
        } catch (Exception $e) {
            $this->logger->error('Protect '.$mode.' failed', $e);
        } finally {
            //Essential step.
            $setup->endSetup();
        }
    }
}
