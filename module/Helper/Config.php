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
use Magento\Integration\Api\IntegrationServiceInterface;
use Magento\Integration\Api\OauthServiceInterface;
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
     * The Environment Variable name for development Protect API URL value
     */
    const NS8_ENV_NAME_API_URL = 'NS8_PROTECT_URL';

    /**
     * The Environment Variable name for development Client API URL value
     */
    const NS8_ENV_NAME_CLIENT_URL = 'NS8_CLIENT_URL';

    /**
     * The canonical name of the Magento Service Integration
     */
    const NS8_INTEGRATION_NAME = 'NS8 Protect';

    /**
     * The canonical name of the Magento extension/module name
     */
    const NS8_MODULE_NAME = 'NS8_Protect';

    /**
     * Default auth user value to utilize in configuration if no admin user is triggering the event
     */
    const DEFAULT_AUTH_USER = 'default';

    /**
     * @var Context
     */
    protected $context;

    /**
     * @var EncryptorInterface
     */
    protected $encryptor;

    /**
     * @var IntegrationServiceInterface
     */
    protected $integrationService;

    /**
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * @var ModuleList
     */
    protected $moduleList;

    /**
     * @var OauthServiceInterface
     */
    protected $oauthService;

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
     * @param IntegrationServiceInterface $integrationService
     * @param ModuleList $moduleList
     * @param OauthServiceInterface $oauthService
     * @param ProductMetadataInterface $productMetadata
     * @param RequestInterface $request
     * @param ScopeConfigInterface $scopeConfig
     * @param TypeListInterface $typeList
     * @param Pool $cacheFrontendPool
     * @param Uri $uri
     * @param WriterInterface $scopeWriter
     */
    public function __construct(
        Context $context,
        EncryptorInterface $encryptor,
        IntegrationServiceInterface $integrationService,
        ModuleList $moduleList,
        OauthServiceInterface $oauthService,
        ProductMetadataInterface $productMetadata,
        RequestInterface $request,
        ScopeConfigInterface $scopeConfig,
        TypeListInterface $typeList,
        Pool $cacheFrontendPool,
        WriterInterface $scopeWriter,
        Uri $uri
    ) {
        $this->context = $context;
        $this->encryptor = $encryptor;
        $this->integrationService = $integrationService;
        $this->oauthService = $oauthService;
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
        // TODO: this needs to be more robust. Circle back and bullet proof this with backing tests.
        $ret = join('/', $segments).'/order_id';
     * Gets an access token.
     *
     * @return string|null The NS8 Protect Access Token.
     */
    public function getAccessToken(): ?string
    {
        $storedToken = $this->encryptor->decrypt($this->scopeConfig->getValue('ns8/protect/token'));

        if (!empty($storedToken)) {
            return $storedToken;
        }

        $consumerId = $this->integrationService->findByName(self::NS8_INTEGRATION_NAME)->getConsumerId();
        $consumer = $this->oauthService->loadConsumer($consumerId);
        $accessTokenString = $this->oauthService->getAccessToken($consumerId);
        $accessToken = $this->extractOauthTokenFromAuthString($accessTokenString);
        $protectAccessToken = $this->getProtectAccessToken($consumer->getKey(), $accessToken);

        if (isset($protectAccessToken)) {
            $this->setAccessToken($protectAccessToken);
            $storedToken = $protectAccessToken;
        }

        return $storedToken;
    }

    /**
     * Save an access token.
     * @param string $accessToken
     * @return void
     */
    public function setAccessToken(string $accessToken): void
    {
        $this->scopeWriter->save('ns8/protect/token', $this->encryptor->encrypt($accessToken));
        $this->flushCaches();
    }

    /**
     * Clear relevant caches after configuration change
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
            if (isset($loginUser)) {
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
     * Auth string has a format of oauth_token=ABC&oauth_token_secret=XYZ. This method
     * extracts the oauth_token string.
     *
     * @param string $authString
     *
     * @return string|null Oauth access token.
     */
    private function extractOauthTokenFromAuthString(string $accessTokenString = null) : ?string
    {
        $this->uri->setQuery($accessTokenString);
        $parsedToken = $this->uri->getQueryAsArray();

        return $parsedToken['oauth_token'] ?? null;
    }

    /**
     * Call protect endpoint to exchange Magento creds for a protect access token.
     *
     * @param string $consumerKey
     * @param string $accessToken
     *
     * @return string|null Protect access token.
     */
    private function getProtectAccessToken(string $consumerKey = null, string $accessToken = null) : ?string
    {
        $client = new Client();
        $url = SdkConfigManager::getEnvValue('urls.client_url') . '/api/init/magento/access-token';
        $client->setUri($url);
        $client->setMethod('GET');

        $client->setParameterGet([
            'access_token' => $accessToken,
            'authorization' => $accessToken,
            'oauth_consumer_key' => $consumerKey,
        ]);

        $client->setHeaders([
            'extension-version' => $this->getProtectVersion(),
            'magento-version' => $this->getMagentoVersion(),
        ]);

        try {
            $response = Decoder::decode($client->send()->getBody());
        } catch (Throwable $e) {
            $this->loggingClient->error('Failed to execute API call', $e);
        }

        if (!isset($response) || !isset($response->token)) {
            return null;
        }

        return $response->token;
    }

    /**
     * Init SDK Configuration class for usage
     */
    public function initSdkConfiguration() : void
    {
        SdkConfigManager::initConfiguration();
        $sdkEnv = SdkConfigManager::getEnvironment();
        SdkConfigManager::setValue('platform_version', 'Magento');
        SdkConfigManager::setValue(sprintf('%s.authorization.auth_user', $sdkEnv), $this->getAuthenticatedUserName());
        SdkConfigManager::setValue(sprintf('%s.authorization.access_token', $sdkEnv), (string) $this->getAccessToken());
    }
}
