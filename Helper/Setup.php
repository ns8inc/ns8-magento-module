<?php
namespace NS8\Protect\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\DB\Ddl\Table;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\Message\ManagerInterface;
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
use NS8\ProtectSDK\Uninstaller\Client as UninstallerClient;

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
     * @param ManagerInterface $messageManager
     * @param ModuleListInterface $moduleList
     * @param ProductMetadataInterface $productMetadata
     * @param Registry $registry
     * @param ScopeConfigInterface $scopeConfig
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Config $config,
        CustomStatus $customStatus,
        EncryptorInterface $encryptor,
        ManagerInterface $messageManager,
        ModuleListInterface $moduleList,
        ProductMetadataInterface $productMetadata,
        Registry $registry,
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->customStatus = $customStatus;
        $this->encryptor = $encryptor;
        $this->messageManager = $messageManager;
        $this->moduleList = $moduleList;
        $this->productMetadata = $productMetadata;
        $this->registry = $registry;
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;
        $this->config->initSdkConfiguration();
        $this->loggingClient = new LoggingClient();
    }

    /**
     * activate a single shop
     *
     * @param $storeId - the id of the individual store getting activated
     */
    public function activateShop(int $storeId)
    {
        try {
            $store = $this->storeManager->getStore($storeId);
            $moduleData = $this->moduleList->getOne('NS8_Protect');
            $moduleVersion = $moduleData['setup_version'] ?? '';
            $storeEmail = $this->scopeConfig->getValue('trans_email/ident_sales/email') ?? '';
            $storeUrl = rtrim($store->getBaseUrl(UrlInterface::URL_TYPE_WEB, true), '/');
            $merchantId = $this->config->getMerchantId();
            $merchantId = empty($merchantId) ? $this->config->generateMerchantId() : $merchantId;
            $this->config->initSdkConfiguration(true, $storeId);
            $installRequestData = [
                'storeUrl' => $storeUrl,
                'email' => $storeEmail,
                'multistoreMerchantId' => $merchantId,
                'moduleVersion' => $moduleVersion,
                'platformVersion' => (string) $this->productMetadata->getVersion()
            ];

            // phpcs:ignore
            $devToken = getenv('NS8_ACCESS_TOKEN');
            $installResult = [ 'accessToken' => $devToken ];
            if (!$devToken) {
                $installResult = InstallerClient::install('magento', $installRequestData);
            }

            if (!isset($installResult['accessToken'])) {
                throw new InstallException(
                    'This store\'s domain has already been registered and cannot be reused with NS8 Protect. ' .
                    'If this is an error, please contact support@ns8.com.'
                );
            }

            $this->config->setAccessToken($store->getStoreId(), $installResult['accessToken']);
            $this->config->setIsMerchantActive($store->getStoreId(), true);
        } catch (\Throwable $t) {
            $this->messageManager->addErrorMessage($t->getMessage());
            $this->loggingClient->error(sprintf('Install failed: %s', $t->getMessage()));
        }
    }

    /**
     * Deactivate a single shop
     *
     * @param int $storeId - the id of the individual store getting de-activated
     * @param ProtectMetadata $metadata - the store info
     */
    public function deactivateShop(int $storeId): void
    {
        $meta = $this->config->getStoreMetadata($storeId);
        if ($meta && !$meta->isActive) {
            return;
        }
        $this->config->initSdkConfiguration(true, $storeId);
        UninstallerClient::uninstall();
        $this->config->setIsMerchantActive($storeId, false);
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
                $isActive = (bool) $this->scopeConfig->getValue('ns8/protect/is_merchant_active');
                $this->config->setAccessToken($storeId, $previousToken);
                $this->config->setIsMerchantActive($storeId, $isActive);
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
