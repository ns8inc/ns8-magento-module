<?php

namespace NS8\Protect\Helper;

use Throwable;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Cache\Type\Config as CacheTypeConfig;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Cache\Frontend\Pool;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\Module\ModuleList;
use Magento\Framework\ObjectManager\ContextInterface;
use NS8\ProtectSDK\Config\Manager as SdkConfigManager;
use NS8\ProtectSDK\Security\Client as SecurityClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;
use Zend\Http\Client;
use Zend\Json\Decoder;
use Zend\Uri\Uri;

/**
 * Generic Helper/Utility class with convenience methods for common ops
 */
class Config extends AbstractHelper
{
    /**
     * The canonical name of the Magento extension/module name
     */
    const NS8_MODULE_NAME = 'NS8_Protect';

    /**
     * Default auth user value to utilize in configuration if no admin user is triggering the event
     */
    const DEFAULT_AUTH_USER = 'default';

    const ACCESS_TOKEN_CONFIG_KEY = 'ns8/protect/token';

    /**
     * Config path for if the merchant is active
     */
    const IS_MERCHANT_ACTIVE = 'ns8/protect/is_merchant_active';

    /**
     * @var Context
     */
    protected $context;

    /**
     * @var EncryptorInterface
     */
    protected $encryptor;

    /**
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * @var ModuleList
     */
    protected $moduleList;

    /**
     * @var ProductMetadataInterface
     */
    protected $productMetadata;

    /**
     * @var RequestInterface
     */
    protected $request;

    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var WriterInterface
     */
    protected $scopeWriter;

    /**
     * @var TypeListInterface
     */
    protected $typeList;

    /**
     * @var Pool
     */
    protected $cacheFrontendPool;

    /**
     * @var Uri
     */
    protected $uri;

    /**
     * Default constructor
     *
     * @param Context $context
     * @param EncryptorInterface $encryptor
     * @param ModuleList $moduleList
     * @param Pool $cacheFrontendPool
     * @param ProductMetadataInterface $productMetadata
     * @param RequestInterface $request
     * @param ScopeConfigInterface $scopeConfig
     * @param TypeListInterface $typeList
     * @param Uri $uri
     * @param WriterInterface $scopeWriter
     */
    public function __construct(
        Context $context,
        EncryptorInterface $encryptor,
        ModuleList $moduleList,
        Pool $cacheFrontendPool,
        ProductMetadataInterface $productMetadata,
        RequestInterface $request,
        ScopeConfigInterface $scopeConfig,
        TypeListInterface $typeList,
        Uri $uri,
        WriterInterface $scopeWriter
    ) {
        $this->context = $context;
        $this->encryptor = $encryptor;
        $this->moduleList = $moduleList;
        $this->productMetadata = $productMetadata;
        $this->request = $request;
        $this->scopeConfig = $scopeConfig;
        $this->scopeWriter = $scopeWriter;
        $this->typeList = $typeList;
        $this->cacheFrontendPool = $cacheFrontendPool;
        $this->uri = $uri;

        $this->loggingClient = new LoggingClient();
    }

    /**
     * Safely try to get an Apache environment variable.
     * @internal this is only for NS8 local developers in testing.
     * @param string $envVarName Variable name. Must be `NS8_CLIENT_URL` OR `NS8_PROTECT_URL`.
     * @return string|null In production, this should always return null.
     */
    public function getEnvironmentVariable(string $envVarName): ?string
    {
        $ret = $this->request->getServer($envVarName);

        if (!isset($ret)) {
            $this->loggingClient->debug('Failed to get environment variable "'.$envVarName.'"');
        }

        return $ret;
    }

    /**
     * Sets if the merchant is Active for NS8
     *
     * @param bool $value The value we want to set for the merchant's activation status
     *
     * @return void
     */
    public function setIsMerchantActive(bool $value): void
    {
        $this->scopeWriter->save(self::IS_MERCHANT_ACTIVE, $value);
        $this->flushCaches();
    }

    /**
     * Returns if the merchant is Active for NS8
     *
     * @return bool
     */
    public function isMerchantActive(): bool
    {
        return (bool) $this->scopeConfig->getValue(self::IS_MERCHANT_ACTIVE);
    }

    /**
     * Retrieve an access token.
     *
     * @return string|null The NS8 Protect Access Token.
     */
    public function getAccessToken(): ?string
    {
        return $this->encryptor->decrypt($this->scopeConfig->getValue(self::ACCESS_TOKEN_CONFIG_KEY));
    }

    /**
     * Saves a Magento configurable value in an encrypted format
     *
     * @param string $key The key of the configurable value
     * @param string $value The value we want to store and encrypt for the configurable value
     * @return void
     */
    public function setEncryptedConfigValue(string $key, string $value): void
    {
        $this->scopeWriter->save($key, $this->encryptor->encrypt($value));
        $this->flushCaches();
    }

    /**
     * Clear relevant caches after configuration change has occurred.
     *
     * @return void
     */
    public function flushCaches(): void
    {
        $cacheTypesToClear = [
            'config',
            'layout',
            'block_html',
            'config_integration',
            'config_integration_api',
            'config_webservice'
        ];

        foreach ($cacheTypesToClear as $cacheType) {
            $this->typeList->cleanType($cacheType);
        }

        foreach ($this->cacheFrontendPool as $cacheFrontend) {
            $cacheFrontend->getBackend()->clean();
        }
    }

    /**
     * Get's the current Magento version
     *
     * @return string
     */
    public function getMagentoVersion(): string
    {
        return $this->productMetadata->getVersion();
    }

    /**
     * Gets the installed version of Protect
     *
     * @return string|null
     */
    public function getProtectVersion(): ?string
    {
        return $this->moduleList->getOne(self::NS8_MODULE_NAME)['setup_version'];
    }

    /**
     * Get's the authenticated user name for the admin user
     * @return string|null
     */
    public function getAuthenticatedUserName(): ?string
    {
        $username = self::DEFAULT_AUTH_USER;
        try {
            $auth = $this->context->getAuth();
            $loginUser = $auth->getUser();
            if ($loginUser && $loginUser->getUserName()) {
                $username = $loginUser->getUserName();
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to get username', $e);
        }
        return $username;
    }

    /**
     * Determines if the current user is allowed to see a custom Protect UI element
     * @param ContextInterface $context A Page/Controller context
     * @return boolean
     */
    public function isAllowed(ContextInterface $context)
    {
        return $context->getAuthorization()->isAllowed(self::NS8_MODULE_NAME.'::admin');
    }

    /**
     * Init SDK Configuration class for usage
     *
     * @param bool $isAuthInfoRequired Implies if the SDK should be configured to required authorization information
     *
     * @return voice
     */
    public function initSdkConfiguration(bool $isAuthInfoRequired = true) : void
    {
        SdkConfigManager::initConfiguration();
        $sdkEnv = SdkConfigManager::getEnvironment();
        SdkConfigManager::setValue('platform_version', 'Magento');
        SdkConfigManager::setValue(sprintf('%s.authorization.required', $sdkEnv), $isAuthInfoRequired);
        SdkConfigManager::setValue(sprintf('%s.authorization.auth_user', $sdkEnv), $this->getAuthenticatedUserName());
        SdkConfigManager::setValue(sprintf('%s.authorization.access_token', $sdkEnv), (string) $this->getAccessToken());
    }
}
