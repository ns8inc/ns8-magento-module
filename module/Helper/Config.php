<?php

namespace NS8\Protect\Helper;

use Exception;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Cache\Type\Config as CacheTypeConfig;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\Module\ModuleList;
use Psr\Log\LoggerInterface;
use UnexpectedValueException;

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
     * @var Context
     */
    protected $context;

    /**
     * @var EncryptorInterface
     */
    protected $encryptor;

    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @var ModuleList
     */
    protected $moduleList;

    /**
     * @var ProductMetadataInterface
     */
    protected $productMetadata;

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
     * Default constructor
     *
     * @param Context $context
     * @param EncryptorInterface $encryptor
     * @param LoggerInterface $loggerInterface
     * @param ModuleList $moduleList
     * @param ProductMetadataInterface $productMetadata
     * @param ScopeConfigInterface $scopeConfig
     * @param TypeListInterface $typeList
     * @param WriterInterface $scopeWriter
     */
    public function __construct(
        Context $context,
        EncryptorInterface $encryptor,
        LoggerInterface $loggerInterface,
        ModuleList $moduleList,
        ProductMetadataInterface $productMetadata,
        ScopeConfigInterface $scopeConfig,
        TypeListInterface $typeList,
        WriterInterface $scopeWriter
    ) {
        $this->context = $context;
        $this->encryptor = $encryptor;
        $this->logger = $loggerInterface;
        $this->moduleList = $moduleList;
        $this->productMetadata = $productMetadata;
        $this->scopeConfig = $scopeConfig;
        $this->scopeWriter = $scopeWriter;
        $this->typeList = $typeList;
    }

    /**
     * Safely try to get an Apache environment variable.
     * @internal this is only for NS8 local developers in testing.
     * @param string $envVarName Variable name. Must be `NS8_CLIENT_URL` OR `NS8_PROTECT_URL`.
     * @return string|null In production, this should always return null.
     */
    public function getEnvironmentVariable(string $envVarName): ?string
    {
        $ret = null;
        try {
            $ret = $_SERVER[$envVarName];
        } catch (Exception $e) {
            $this->logger->log('DEBUG', 'Failed to get environment variable "'.$envVarName.'"', ['error'=>$e]);
        }
        return $ret;
    }

    /**
     * Gets an access token.
     *
     * @return string|null The NS8 Protect Access Token.
     */
    public function getAccessToken() : ?string
    {
        $storedToken = $this->encryptor->decrypt($this->scopeConfig->getValue('ns8/protect/token'));
        return $storedToken;
    }

    /**
     * Save an access token.
     * @param string $accessToken
     * @return void
     */
    public function setAccessToken(string $accessToken) : void
    {
        $this->scopeWriter->save('ns8/protect/token', $this->encryptor->encrypt($accessToken));
        $this->flushConfigCache();
    }

    /**
     * Clear the cache
     *
     * @return void
     */
    public function flushConfigCache() : void
    {
        $this->typeList->cleanType(CacheTypeConfig::TYPE_IDENTIFIER);
    }

    /**
     * Get's the current Magento version
     *
     * @return string
     */
    public function getMagentoVersion() : string
    {
        return $this->productMetadata->getVersion();
    }

    /**
     * Gets the installed version of Protect
     *
     * @return string|null
     */
    public function getProtectVersion() : ?string
    {
        return $this->moduleList->getOne(Config::NS8_MODULE_NAME)['setup_version'];
    }

    /**
     * Get's the authenticated user name for the admin user
     * @return string|null
     */
    public function getAuthenticatedUserName() : ?string
    {
        $username = null;
        try {
            $auth = $this->context->getAuth();
            $loginUser = $auth->getUser();
            if (isset($loginUser)) {
                $username = $loginUser->getUserName();
            }
        } catch (Exception $e) {
            $this->logger->log('ERROR', 'Failed to get username', ['error'=>$e]);
        }
        return $username;
    }
}
