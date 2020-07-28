<?php
namespace NS8\Protect\Observer\Admin;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Message\ManagerInterface;
use Magento\Framework\Module\ModuleListInterface;
use Magento\Framework\Registry;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Exception\InstallException;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Installer\Client as InstallerClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

/**
 * Responds to Order Update events
 */
class DashboardInstantiation implements ObserverInterface
{
    /**
     * Registry key used to determine fetching the access token between setup and update
     */
    const ACCESS_TOKEN_SET_KEY = 'ns8_access_token_set';

    /**
     * The  config manager
     *
     * @var Config
     */
    protected $config;

    /**
     * The logging client.
     *
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * Message manager
     * @var ManagerInterface
     */
    protected $messageManager;

    /**
     * Module list object to fetch version information
     *
     * @var ModuleListInterface
     */
    protected $moduleList;

    /**
     * Product metadata manager
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
     * Default constructor
     *
     * @param Config $config
     * @param ManagerInterface $messageManager
     * @param ModuleListInterface $moduleList,
     * @param ProductMetadataInterface $productMetadata,
     * @param Registry $registry
     * @param ScopeConfigInterface $scopeConfig
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Config $config,
        ManagerInterface $messageManager,
        ModuleListInterface $moduleList,
        ProductMetadataInterface $productMetadata,
        Registry $registry,
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
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
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer) : void
    {
        try {
            $store = $this->storeManager->getStore();
            $this->config->setAccessToken(1, '77771263-c3ed-4cb1-8845-d6c6df923b26');
            $this->config->setAccessToken(2, '4a5cdc94-6ea1-4753-a3a5-dde3474594c7');
            $this->config->setIsMerchantActive(1, true);
            $this->config->setIsMerchantActive(2, true);
            $x = print_r($this->config->getStoreMetadatas());
            die($x);

            // TODO use $storeId
            if ($this->config->isMerchantActive() || $this->config->getAccessToken()) {
                return;
            }

            $moduleData = $this->moduleList->getOne('NS8_Protect');
            $moduleVersion = $moduleData['setup_version'] ?? '';
            $storeEmail = $this->scopeConfig->getValue('trans_email/ident_sales/email') ?? '';
            $storeUrl = rtrim($store->getBaseUrl(UrlInterface::URL_TYPE_WEB, true), '/');
            $merchantId = $this->config->getMerchantId();
            $merchantId = empty($merchantId) ? $this->config->generateMerchantId() : $merchantId;
            $installRequestData = [
                'storeUrl' => $storeUrl,
                'email' => $storeEmail,
                'multistoreMerchantId' => $merchantId,
                'moduleVersion' => $moduleVersion,
                'platformVersion' => (string) $this->productMetadata->getVersion()
            ];

            $installResult = InstallerClient::install('magento', $installRequestData);
            if (!isset($installResult['accessToken'])) {
                throw new InstallException(
                    'This store\'s domain has already been registered and cannot be reused with NS8 Protect. ' .
                    'If this is an error, please contact support@ns8.com.'
                );
            }

            // TODO use $storeId
            $this->config->setAccessToken(null, $installResult['accessToken']);
            $this->config->setIsMerchantActive(null, true);
        } catch (\Throwable $t) {
            $this->messageManager->addErrorMessage($t->getMessage());
            $this->loggingClient->error(sprintf('Install failed: %s', $t->getMessage()));
        }
    }
}
