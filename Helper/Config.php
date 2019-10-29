<?php

namespace NS8\Protect\Helper;

use Exception;
use Magento\Backend\App\Action\Context;
use Magento\Backend\Model\UrlInterface;
use Magento\Framework\App\Cache\Type\Config as CacheTypeConfig;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\State;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\Module\ModuleList;
use Magento\Framework\Stdlib\CookieManagerInterface;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Generic Helper/Utility class with convenience methods for common ops
 */
class Config extends AbstractHelper
{
    /**
     * The URL to the Development Protect API
     */
    const NS8_DEV_URL_API = 'http://magento-v2-api.ngrok.io';
    /**
     * The URL to the Development Client API
     */
    const NS8_DEV_URL_CLIENT = 'http://magento-v2-client.ngrok.io';
    /**
     * The URL to the Production Protect API
     */
    const NS8_PRODUCTION_URL_API = 'https://protect.ns8.com';
    /**
     * The URL to the Production Client API
     */
    const NS8_PRODUCTION_URL_CLIENT = 'https://protect-client.ns8.com';
    /**
     * The Environment Variable name for development Protect API URL value
     */
    const NS8_ENV_NAME_API_URL = 'NS8_PROTECT_URL';
    /**
     * The Environment Variable name for development Client API URL value
     */
    const NS8_ENV_NAME_CLIENT_URL = 'NS8_CLIENT_URL';

    const NS8_INTEGRATION_NAME = 'NS8 Protect';

    /*
     * Placeholders for future functionality
    */
    protected $backendUrl;
    protected $cacheTypeList;
    protected $context;
    protected $cookieManager;
    protected $encryptor;
    protected $moduleList;
    protected $orderRepository;
    protected $productMetadata;
    protected $request;
    protected $scopeConfig;
    protected $scopeWriter;
    protected $state;
    protected $storeManager;

    /**
     * Default constructor
     *
     * @param Context $context
     * @param CookieManagerInterface $cookieManager
     * @param EncryptorInterface $encryptor
     * @param ModuleList $moduleList
     * @param OrderRepositoryInterface $orderRepository
     * @param ProductMetadataInterface $productMetadata
     * @param RequestInterface $request
     * @param ScopeConfigInterface $scopeConfig
     * @param State $state
     * @param StoreManagerInterface $storeManager
     * @param TypeListInterface $cacheTypeList
     * @param UrlInterface $backendUrl
     * @param WriterInterface $scopeWriter
     */
    public function __construct(
        Context $context,
        CookieManagerInterface $cookieManager,
        EncryptorInterface $encryptor,
        LoggerInterface $loggerInterface,
        ModuleList $moduleList,
        OrderRepositoryInterface $orderRepository,
        ProductMetadataInterface $productMetadata,
        RequestInterface $request,
        ScopeConfigInterface $scopeConfig,
        State $state,
        StoreManagerInterface $storeManager,
        TypeListInterface $cacheTypeList,
        UrlInterface $backendUrl,
        WriterInterface $scopeWriter
    ) {
        $this->backendUrl = $backendUrl;
        $this->cacheTypeList = $cacheTypeList;
        $this->context = $context;
        $this->cookieManager = $cookieManager;
        $this->encryptor = $encryptor;
        $this->logger = $loggerInterface;
        $this->moduleList = $moduleList;
        $this->orderRepository = $orderRepository;
        $this->productMetadata = $productMetadata;
        $this->request = $request;
        $this->scopeConfig = $scopeConfig;
        $this->scopeWriter = $scopeWriter;
        $this->state = $state;
        $this->storeManager = $storeManager;
    }

    /**
     * Assembles the URL using environment variables and handles parsing extra `/`
     *
     * @param string $envVarName
     * @param string $defaultUrl
     * @param string $route
     * @return string The final URL
     */
    private function getNS8Url($envVarName, $defaultUrl, $route = '')
    {
        $url = getenv($envVarName, true) ?: getenv($envVarName) ?: '';
        $url = trim($url);

        if (substr($url, -1) === '/') {
            $url = substr($url, 0, -1);
        }

        if (empty($url)) {
            $url = $defaultUrl;
        }
        if ($url === Config::NS8_PRODUCTION_URL_API ||
            $url === Config::NS8_PRODUCTION_URL_CLIENT) {
            throw new Exception('Cannot use Production URLs right now.');
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
     * Gets the current protect API URL based on the environment variables.
     * For now, defaults to Development.
     * @todo Revisit defaults on preparation to release to Production
     *
     * @param string $route
     * @return string The NS8 Protect URL in use for this instance.
     */
    public function getApiBaseUrl($route = '')
    {
        return $this->getNS8Url(Config::NS8_ENV_NAME_API_URL, Config::NS8_DEV_URL_API, $route);
    }

    /**
     * Gets the current protect Client URL based on the environment variables.
     * For now, defaults to Development.
     * @todo Revisit defaults on preparation to release to Production
     *
     * @param string $route
     * @return string The NS8 Protect Client URL in use for this instance.
     */
    public function getNS8ClientUrl($route = '')
    {
        return $this->getNS8Url(Config::NS8_ENV_NAME_CLIENT_URL, Config::NS8_DEV_URL_CLIENT, $route);
    }

    /**
     * Gets the current protect Middleware URL based on the environment variables.
     * For now, defaults to Development.
     * @todo Revisit defaults on preparation to release to Production
     *
     * @param string $route
     * @return string The NS8 Protect Middleware URL in use for this instance.
     */
    public function getNS8MiddlewareUrl($route = '')
    {
        if (substr($route, 0, 1) === '/') {
            $route = substr($route, 1);
        }
        $routeSlug = 'api'.'/'.$route;
        return $this->getNS8Url(Config::NS8_ENV_NAME_CLIENT_URL, Config::NS8_DEV_URL_CLIENT, $routeSlug);
    }

    /**
     * Gets an access token.
     *
     *
     * @return string The NS8 Protect Access Token.
     */
    public function getAccessToken()
    {
        $storedToken = $this->encryptor->decrypt($this->scopeConfig->getValue('ns8/protect/token'));
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
        $this->scopeWriter->save('ns8/protect/token', $this->encryptor->encrypt($accessToken));
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
        return $this->moduleList->getOne('NS8_Protect')['setup_version'];
    }

    //  needed for install/upgrade routines - do not call from anywhere else
    public function setAdminAreaCode()
    {
        try {
            if (!isset($this->state->_areaCode)) {
                $this->state->setAreaCode('adminhtml');
            }
        } catch (Exception $e) {
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

    /**
     * Get's the authenticated user name for the admin user
     * @return ?string The admin user name or null
     */
    public function getAuthenticatedUserName() : ?string
    {
        $username = null;
        try {
            $auth = $this->context->getAuth();
            $loginUser = $auth->getUser();
            if ($loginUser) {
                $username = $loginUser->getUserName();
            }
        } catch (Exception $e) {
            // intentionally left empty
        }
        return $username;
    }

    /**
     * Get the Order display id from the requested order
     * @param ?string $orderId
     * @return ?string An order increment id
     */
    public function getOrderIncrementId(string $orderId = null): ?string
    {
        $ret = null;
        try {
            if (!isset($orderId)) {
                $orderId = $this->request->getParam('order_id');
            }
            $order = $this->orderRepository->get($orderId);
            $ret = $order->getIncrementId();
        } catch (Exception $e) {
        }
        return $ret;
    }
}
