<?php
namespace NS8\Protect\Helper;

use Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface;
use Magento\Eav\Setup\EavSetupFactory;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\DB\Ddl\Table;
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

            $connection = $setup->getConnection();
            $connection->addColumn(
                $setup->getTable('sales_order'),
                'eq8_score',
                [
                    'type' => Table::TYPE_SMALLINT,
                    'nullable' => true,
                    'comment' => 'EQ8 Score'
                ]
            );

            $connection->addColumn(
                $setup->getTable('sales_order_grid'),
                'eq8_score',
                [
                    'type' => Table::TYPE_SMALLINT,
                    'nullable' => true,
                    'comment' => 'EQ8 Score'
                ]
            );

            // $connection->addIndex(
            //     $setup->getTable('sales_order'),
            //     $setup->getIdxName('sales_order', ['eq8_score']),
            //     ['eq8_score']
            // );

            // $connection->addIndex(
            //     $setup->getTable('sales_order_grid'),
            //     $setup->getIdxName('sales_order_grid', ['eq8_score']),
            //     ['eq8_score']
            // );


        } catch (Exception $e) {
            $this->logger->error('Protect '.$mode.' failed', $e);
        } finally {
            //Essential step.
            $setup->endSetup();
        }
    }
}
