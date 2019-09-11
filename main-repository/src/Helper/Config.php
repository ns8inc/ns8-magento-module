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
use Psr\Log\LoggerInterface;

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
        CookieManagerInterface $cookieManager,
        LoggerInterface $loggerInterface
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
        $this->logger = $loggerInterface;
    }

    private function getApiUrl($envVarName, $defaultUrl, $route = '')
    {
        $url = getenv($envVarName, true) ?: getenv($envVarName) ?: '';
        $url = trim($url);

        if (substr($url, -1) === '/') {
            $url = substr($url, 0, -1);
        }
        if (empty($url)) {
            $url = $defaultUrl;
        }
        if (!empty($route)) {
            $route = trim($route);
            if (substr($route, -1) === '/') {
                $route = substr($route, 0, -1);
            }
            if(substr($route, 0, 1) === '/') {
                $route = substr($route, 1);
            }
            $url = $url.'/'.$route;
        }
        return $url;
    }

    /**
     * Gets the current protect URL based on the environment variables; defaults to Production.
     *
     * @return string The NS8 Protect URL in use for this instance.
     */
    public function getApiBaseUrl($route)
    {
        return $this->getApiUrl('NS8_PROTECT_URL', 'https://protect.ns8.com', $route);
    }

    /**
     * Gets the current protect URL based on the environment variables; defaults to Production.
     *
     * @return string The NS8 Protect Client URL in use for this instance.
     */
    public function getNS8ClientUrl($route)
    {
        return $this->getApiUrl('NS8_CLIENT_URL', 'https://client.ns8.com', $route);
    }

    /**
     * Gets an access token.
     *
     *
     * @return string The NS8 Protect Access Token.
     */
    public function getAccessToken()
    {
        $storedToken = $this->encryptor->decrypt($this->scopeConfig->getValue('ns8/csp2/token'));
        return $storedToken;
    }

    /**
     * Save an access token.
     *
     *
     * @return string The NS8 Protect Access Token.
     */
    public function setAccessToken($accessToken)
    {
        $this->scopeWriter->save('ns8/csp2/token', $this->encryptor->encrypt($accessToken));
        $this->flushConfigCache();
    }

    public function flushConfigCache()
    {
        $this->cacheTypeList->cleanType(\Magento\Framework\App\Cache\Type\Config::TYPE_IDENTIFIER);
    }
}
