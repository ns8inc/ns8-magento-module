<?php
namespace NS8\Protect\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\DB\Ddl\Table;
use Magento\Framework\Module\ModuleListInterface;
use Magento\Framework\Registry;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Exception\InstallException;
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
     * Registry key used to determine fetching the access token between setup and update
     */
    const ACCESS_TOKEN_SET_KEY = 'ns8_access_token_set';

    /**
     * The protocol we require the store to utilize for NS8 Protect usage
     */
    const MAGENTO_REQUIRED_PROTOCOL = 'https';

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
     * Module list object to fetch version information
     *
     * @var ModuleListInterface
     */
    protected $moduleList;

    /**
     * Product Metadata object to fetch Magento version
     *
     * @var ProductMetadataInterface
     */
    protected $productMetadata;

    /**
     * @var Registry
     */

    protected $registry;

    /**
     * Store manager attribute to fetch store data
     *
     * @var StoreManagerInterface
     */
    protected $storeManager;

    /**
     * Scope config manager to get config data
     *
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @param Config $config
     * @param CustomStatus $customStatus
     * @param ProductMetadataInterface $productMetadata,
     * @param ModuleListInterface $moduleList,
     * @param Registry $registry
     * @param ScopeConfigInterface $scopeConfig
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Config $config,
        CustomStatus $customStatus,
        ProductMetadataInterface $productMetadata,
        ModuleListInterface $moduleList,
        Registry $registry,
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->customStatus = $customStatus;
        $this->moduleList = $moduleList;
        $this->productMetadata = $productMetadata;
        $this->registry = $registry;
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

            // Dispatch event to NS8 Protect that module has been installed/upgraded
            if (!$this->registry->registry(self::ACCESS_TOKEN_SET_KEY)) {
                $moduleData = $this->moduleList->getOne('NS8_Protect');
                $moduleVersion = $moduleData['setup_version'] ?? '';
                $storeEmail = $this->scopeConfig->getValue('trans_email/ident_sales/email') ?? '';
                $storeUrl = rtrim($this->storeManager->getStore()->getBaseUrl(UrlInterface::URL_TYPE_WEB, true), '/');
                $installRequestData = [
                    'storeUrl' => $storeUrl,
                    'email' => $storeEmail,
                    'moduleVersion' => $moduleVersion,
                    'platformVersion' => (string) $this->productMetadata->getVersion()
                ];

                $installResult = InstallerClient::install('magento', $installRequestData);
                $this->config->setEncryptedConfigValue(Config::ACCESS_TOKEN_CONFIG_KEY, $installResult['accessToken']);
                // Set a registry value so we do not attempt to fetch the token a second time
                // if config value has not been saved yet
                $this->registry->register(self::ACCESS_TOKEN_SET_KEY, true);
            }

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
