<?php
namespace NS8\CSP2\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\State as State;
use Magento\Framework\App\Config\ScopeConfigInterface as ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface as WriterInterface;
use Magento\Framework\Encryption\EncryptorInterface as EncryptorInterface;
use Magento\Store\Model\StoreManagerInterface as StoreManagerInterface;
use Magento\Backend\Model\UrlInterface as UrlInterface;
use Magento\Framework\App\ProductMetadataInterface as ProductMetadataInterface;
use Magento\Framework\Module\ModuleList as ModuleList;
use Magento\Framework\App\Cache\TypeListInterface as TypeListInterface;
use Magento\Framework\App\RequestInterface as RequestInterface;
use Magento\Framework\Stdlib\CookieManagerInterface as CookieManagerInterface;

/**
 * Generic Helper/Utility class with convenience methods for common ops
 */
class Config extends AbstractHelper
{
    /*
     * Placeholders for future functionality
    */
    protected $scopeConfig;
    protected $scopeWriter;
    protected $encryptor;
    protected $backendUrl;
    protected $productMetadata;
    protected $moduleList;
    protected $storeManager;
    protected $state;
    protected $cacheTypeList;
    protected $request;
    protected $cookieManager;

    /**
     * Default constructor
     *
     * @param State $state
     * @param ScopeConfigInterface $scopeConfig
     * @param WriterInterface $scopeWriter
     * @param EncryptorInterface $encryptor
     * @param StoreManagerInterface $storeManager
     * @param UrlInterface $backendUrl
     * @param ProductMetadataInterface $productMetadata
     * @param ModuleList $moduleList
     * @param TypeListInterface $cacheTypeList
     * @param RequestInterface $request
     * @param CookieManagerInterface $cookieManager
     */
    public function __construct(
        State $state,
        ScopeConfigInterface $scopeConfig,
        WriterInterface $scopeWriter,
        EncryptorInterface $encryptor,
        StoreManagerInterface $storeManager,
        UrlInterface $backendUrl,
        ProductMetadataInterface $productMetadata,
        ModuleList $moduleList,
        TypeListInterface $cacheTypeList,
        RequestInterface $request,
        CookieManagerInterface $cookieManager
    ) {
        $this->state = $state;
        $this->scopeConfig = $scopeConfig;
        $this->scopeWriter = $scopeWriter;
        $this->encryptor = $encryptor;
        $this->storeManager = $storeManager;
        $this->backendUrl = $backendUrl;
        $this->productMetadata = $productMetadata;
        $this->moduleList = $moduleList;
        $this->cacheTypeList = $cacheTypeList;
        $this->request = $request;
        $this->cookieManager = $cookieManager;
    }

    /**
     * Gets the current protect URL based on the environment variables; defaults to Production.
     *
     * @return string The NS8 Protect URL in use for this instance.
     */
    public function getApiBaseUrl()
    {
        $url = getenv('NS8_PROTECT_URL', true) ?: getenv('NS8_PROTECT_URL');

        if (isset($url) && $url !== "") {
            return $url;
        } else {
            return 'https://protect.ns8.com';
        }
    }
}
