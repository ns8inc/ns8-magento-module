<?php

namespace NS8\CSP2\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\State;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Backend\Model\UrlInterface;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\Module\ModuleList;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Stdlib\CookieManagerInterface;
use Psr\Log\LoggerInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Framework\App\Cache\Type\Config as CacheTypeConfig;

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

    /**
     * Assembles the URL using environment variables and handles parsing extra `/`
     *
     * @param string $envVarName
     * @param string $defaultUrl
     * @param string $route
     * @return string The final URL
     */
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
            if (substr($route, 0, 1) === '/') {
                $route = substr($route, 1);
            }
            $url = $url.'/'.$route;
        }
        return $url;
    }

    /**
     * Gets the current protect API URL based on the environment variables; defaults to Production.
     *
     * @param string $route
     * @return string The NS8 Protect URL in use for this instance.
     */
    public function getApiBaseUrl($route = '')
    {
        return $this->getApiUrl('NS8_PROTECT_URL', 'https://protect.ns8.com', $route);
    }

    /**
     * Gets the current protect Client URL based on the environment variables; defaults to Production.
     *
     * @param string $route
     * @return string The NS8 Protect Client URL in use for this instance.
     */
    public function getNS8ClientUrl($route = '')
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
        $this->cacheTypeList->cleanType(CacheTypeConfig::TYPE_IDENTIFIER);
    }

    public function getAdminUrl($path, $params = null)
    {
        return $this->backendUrl->getUrl($path, $params);
    }

    public function getMagentoVersion()
    {
        return $this->productMetadata->getVersion();
    }

    public function getExtensionVersion()
    {
        return $this->moduleList->getOne('NS8_CSP2')['setup_version'];
    }

    //  needed for install/upgrade routines - do not call from anywhere else
    public function setAdminAreaCode()
    {
        try {
            if (!isset($this->state->_areaCode)) {
                $this->state->setAreaCode('adminhtml');
            }
        } catch (\Exception $e) {
            // intentionally left empty
        }
    }

    public function getStores()
    {
        $result = [];
        $stores = $this->storeManager->getStores();

        foreach ($stores as $store) {
            array_push($result, [
                'id' => $store->getId(),
                'websiteId' => $store->getWebsiteId(),
                'code' => $store->getCode(),
                'name' => $store->getName(),
                'groupId' => $store->getStoreGroupId(),
                'isActive' => $store->isActive(),
                'url' => $store->getCurrentUrl(true)
            ]);
        }
        return $result;
    }

    public function getStore()
    {
        $store = $this->storeManager->getStore();

        $data = [
            'id' => $store->getId(),
            'websiteId' => $store->getWebsiteId(),
            'code' => $store->getCode(),
            'name' => $store->getName(),
            'groupId' => $store->getStoreGroupId(),
            'isActive' => $store->isActive(),
            'url' => $store->getCurrentUrl(true)
        ];
        return $data;
    }

    public function getStoreId()
    {
        $store = $this->storeManager->getStore();
        return $store->getId();
    }

    public function getStoreEmail()
    {
        return $this->scopeConfig->getValue(
            'trans_email/ident_sales/email',
            ScopeInterface::SCOPE_STORE
        );
    }

    public function remoteAddress()
    {
        $xf = $this->request->getServer('HTTP_X_FORWARDED_FOR');

        if (!isset($xf)) {
            $xf = '';
        }

        $remoteAddr = $this->request->getServer('REMOTE_ADDR');

        if (!isset($remoteAddr)) {
            $remoteAddr = '';
        }

        if (isset($xf) && trim($xf) != '') {
            $xf = trim($xf);
            $xfs = [];

            //  see if multiple addresses are in the XFF header
            if (strpos($xf, '.') !== false) {
                $xfs = explode(',', $xf);
            } elseif (strpos($xf, ' ') !== false) {
                $xfs = explode(' ', $xf);
            }

            if (!empty($xfs)) {
                $count = count($xfs);

                //  get first public address, since multiple private routings can occur and be added to forwarded list
                for ($i = 0; $i < $count; $i++) {
                    $ipTrim = trim($xfs[$i]);

                    if (substr($ipTrim, 0, 7) == '::ffff:' && count(explode('.', $ipTrim)) == 4) {
                        $ipTrim = substr($ipTrim, 7);
                    }

                    if ($ipTrim != '' && substr($ipTrim, 0, 3) != '10.'
                        && substr($ipTrim, 0, 7) != '172.16.'
                        && substr($ipTrim, 0, 7) != '172.31.'
                        && substr($ipTrim, 0, 8) != '127.0.0.'
                        && substr($ipTrim, 0, 8) != '192.168.' && $ipTrim != 'unknown' && $ipTrim != '::1') {
                        return ($ipTrim);
                    }
                }
                $xf = trim($xfs[0]);
            }

            if (substr($xf, 0, 7) == '::ffff:' && count(explode('.', $xf)) == 4) {
                $xf = substr($xf, 7);
            }

            //  a tiny % of hits have an unknown ip address
            if (substr($xf, 0, 7) == 'unknown') {
                return '127.0.0.1';
            }

            return ($xf);
        } else {
            //  a tiny % of hits have an unknown ip address, so return a default address
            if (substr($remoteAddr, 0, 7) == 'unknown') {
                return '127.0.0.1';
            }

            return ($remoteAddr);
        }
    }
}
