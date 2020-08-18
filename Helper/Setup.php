<?php
namespace NS8\Protect\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\DB\Ddl\Table;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\CustomStatus;
use NS8\Protect\Helper\Order;
use NS8\ProtectSDK\Installer\Client as InstallerClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

/**
 * Execute the install/upgrade logic for the Protect extension
 */
class Setup extends AbstractHelper
{
    /**
     * Mode for installig module as passed in from Magento Set-Up Trigger
     */
    const INSTALL_MODE = 'install';

    /**
     * Mode for upgrading the module as passed in from Magento Set-up Trigger
     */
    const UPGRADE_MODE = 'upgrade';
    /**
     * The custom status helper.
     *
     * @var CustomStatus
     */
    protected $customStatus;

    /**
     * The logging client.
     *
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * Config helper for accessing config data
     *
     * @var Config
     */
    protected $config;

    /**
     * @var EncryptorInterface
     */
    protected $encryptor;


    /**
     * Scope config for accessing core config data
     *
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * Store manager attribute to fetch store data
     *
     * @var StoreManagerInterface
     */
    protected $storeManager;

    /**
     * @param Config $config
     * @param CustomStatus $customStatus
     * @param EncryptorInterface $encryptor
     * @param ScopeConfigInterface $scopeConfig
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Config $config,
        CustomStatus $customStatus,
        EncryptorInterface $encryptor,
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->customStatus = $customStatus;
        $this->encryptor = $encryptor;
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;

        $this->config->initSdkConfiguration();
        $this->loggingClient = new LoggingClient();
    }

    /**
     * Runs the install/upgrade logic for data (configuration, integration, etc)
     *
     * @param string $mode Should be "install" or "upgrade"
     * @param ModuleDataSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     */
    public function upgradeData(string $mode, ModuleDataSetupInterface $setup, ModuleContextInterface $context) : void
    {
        //Essential step.
        $setup->startSetup();
        try {
            // Create or update our custom statuses using the current mode
            $this->customStatus->setCustomStatuses('Running Data '.$mode);

            // Update current eq8_score with value from v1 if it exists AND if the current score is null
            $connection = $setup->getConnection();
            $currentEq8Col = Order::EQ8_SCORE_COL;
            $tablesWithEq8Cols = ['sales_order', 'sales_order_grid'];

            foreach ($tablesWithEq8Cols as $tableName) {
                if ($connection->tableColumnExists($tableName, 'eq8_score')) {
                    $connection->update(
                        $tableName,
                        [$currentEq8Col => new \Zend_Db_Expr(sprintf('%s.%s', $tableName, 'eq8_score'))],
                        ['? IS NULL' => new \Zend_Db_Expr(sprintf('%s.%s', $tableName, $currentEq8Col))]
                    );
                }
            }

            $previousToken = $this->encryptor->decrypt($this->scopeConfig->getValue('ns8/protect/token'));
            $currentMetadata = $this->config->getStoreMetadatas();
            if ($mode === self::UPGRADE_MODE && $previousToken && empty($currentMetadata)) {
                $storeId = $this->storeManager->getStore()->getId();
                $isActive = (bool) $this->scopeConfig->getValue(self::IS_MERCHANT_ACTIVE);
                $this->config->setAccessToken(STORE_ID, $previousToken);
                $this->config->setIsActive(StorE_ID, $isActive);
            }
        } catch (Throwable $e) {
            $this->loggingClient->error("Protect $mode failed", $e);
            throw $e;
        } finally {
            //Essential step.
            $setup->endSetup();
        }
    }

    /**
     * Runs the install/upgrade logic for the schema (DDL/DML scripts)
     *
     * @param string $mode Should be "install" or "upgrade"
     * @param SchemaSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     */
    public function upgradeSchema(string $mode, SchemaSetupInterface $setup, ModuleContextInterface $context) : void
    {
        //Essential step.
        $setup->startSetup();
        try {
            // Create or update our custom statuses using the current mode
            $this->customStatus->setCustomStatuses('Running Schema '.$mode);

            $connection = $setup->getConnection();
            $connection->addColumn(
                $setup->getTable('sales_order'),
                Order::EQ8_SCORE_COL,
                [
                    'type' => Table::TYPE_SMALLINT,
                    'nullable' => true,
                    'comment' => 'EQ8 Score'
                ]
            );
            $connection->addColumn(
                $setup->getTable('sales_order_grid'),
                Order::EQ8_SCORE_COL,
                [
                    'type' => Table::TYPE_SMALLINT,
                    'nullable' => true,
                    'comment' => 'EQ8 Score'
                ]
            );
            $connection->addIndex(
                $setup->getTable('sales_order'),
                $setup->getIdxName('sales_order', [Order::EQ8_SCORE_COL]),
                [Order::EQ8_SCORE_COL]
            );
            $connection->addIndex(
                $setup->getTable('sales_order_grid'),
                $setup->getIdxName('sales_order_grid', [Order::EQ8_SCORE_COL]),
                [Order::EQ8_SCORE_COL]
            );
        } catch (Throwable $e) {
            $this->loggingClient->error("Protect $mode failed", $e);
            throw $e;
        } finally {
            //Essential step.
            $setup->endSetup();
        }
    }
}
