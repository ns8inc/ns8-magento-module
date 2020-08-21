<?php

declare(strict_types=1);

namespace NS8\Protect\Test;

use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Cache\Frontend\Pool;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\App\ProductMetadataInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\Module\ModuleList;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Data\ProtectMetadata;
use NS8\ProtectSDK\Config\Manager as SdkConfigManager;
use PHPUnit\Framework\TestCase;
use Zend\Uri\Uri;

/**
 * Tests for Helper\Config.php
 */
class ConfigTest extends TestCase
{
    /** @var Config */
    public $config;

    /** @var ScopeConfigInterface */
    private $scopeConfig;

    /** @var ProtectMetadata[] */
    private $scopeConfigStore;

    public function __construct()
    {
        parent::__construct();

        /** @var Context */
        $context = $this->createMock(Context::class);

        $encryptorTemp = $this->createMock(EncryptorInterface::class);
        $encryptorTemp->method('decrypt')->willReturnArgument(0);
        $encryptorTemp->method('encrypt')->willReturnArgument(0);
        /** @var EncryptorInterface */
        $encryptor = $encryptorTemp;

        /** @var ModuleList */
        $moduleList = $this->createMock(ModuleList::class);
        /** @var Pool */
        $pool = $this->createMock(Pool::class);
        /** @var ProductMetadataInterface */
        $productMetadata = $this->createMock(ProductMetadataInterface::class);
        /** @var RequestInterface */
        $request = $this->createMock(RequestInterface::class);

        $scopeConfigTemp = $this->createMock(ScopeConfigInterface::class);
        $scopeConfigTemp->method('getValue')
            ->will($this->returnCallback(function ($key) {
                return isset($this->scopeConfigStore[$key]) ? $this->scopeConfigStore[$key] : null;
            }));
        /** @var ScopeConfigInterface */
        $this->scopeConfig = $scopeConfigTemp;

        $scopeWriterTemp = $this->createMock(WriterInterface::class);
        $scopeWriterTemp->method('save')
            ->will($this->returnCallback(function ($key, $value) {
                $this->scopeConfigStore[$key] = $value;
            }));
        /** @var WriterInterface */
        $scopeWriter = $scopeWriterTemp;

        /** @var TypeListInterface */
        $typeList = $this->createMock(TypeListInterface::class);
        /** @var Uri */
        $uri = $this->createMock(Uri::class);
        /** @var StoreManagerInterface */
        $storeManager = $this->createMock(StoreManagerInterface::class);

        $this->config = new Config(
            $context,
            $encryptor,
            $moduleList,
            $pool,
            $productMetadata,
            $request,
            $this->scopeConfig,
            $typeList,
            $uri,
            $scopeWriter,
            $storeManager
        );
    }

    /** Reset the config store before each test */
    public function setUp(): void
    {
        $this->scopeConfigStore = [];
    }

    /** Config::setAccessToken() should set single store's token */
    public function testSetAccessTokenSetsSingle(): void
    {
        $this->config->setAccessToken(1, 'foo');
        $this->assertScopeConfig([
            '1' => new ProtectMetadata('foo', false)
        ]);
    }

    /** Config::setAccessToken() should set multiple stores' tokens */
    public function testSetAccessTokenSetsMultiple(): void
    {
        $this->config->setAccessToken(1, 'foo');
        $this->config->setAccessToken(2, 'bar');
        $this->assertScopeConfig([
            '1' => new ProtectMetadata('foo', false),
            '2' => new ProtectMetadata('bar', false)
        ]);
    }

    /** Config::setAccessToken() should not change isActive */
    public function testSetAccessTokenDoesntChangeIsActive(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata('foo', true)
        ]);
        $this->config->setAccessToken(1, 'bar');
        $this->assertScopeConfig([
            '1' => new ProtectMetadata('bar', true)
        ]);
    }

    /** Config::getAccessToken() should return the right store's token */
    public function testGetAccessTokenReturnsCorrect(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata('foo', true),
            '2' => new ProtectMetadata('bar', true)
        ]);
        $this->assertEquals('foo', $this->config->getAccessToken(1));
        $this->assertEquals('bar', $this->config->getAccessToken(2));
    }

    /** Config::getAccessToken() should return null when passed a non-existent store ID */
    public function testGetAccessTokenReturnsNullWhenNotFound(): void
    {
        $token = $this->config->getAccessToken(1);
        $this->assertNull($token);
    }

    /** Config::setIsMerchantActive() should not do anything when passed a non-existent store ID */
    public function testSetIsMerchantActiveNoopsWhenNotFound(): void
    {
        $this->config->setIsMerchantActive(1, true);
        $this->assertNull($this->scopeConfig->getValue(Config::METADATA_CONFIG_KEY));
    }

    /** Config::setIsMerchantActive() should set single store's isActive */
    public function testSetIsMerchantActiveSetsSingle(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata('foo', false)
        ]);
        $this->config->setIsMerchantActive(1, true);
        $this->assertScopeConfig([
            '1' => new ProtectMetadata('foo', true)
        ]);
    }

    /** Config::setIsMerchantActive() should not activate a store with a null token */
    public function testSetIsMerchantActiveWontActivateWithNullToken(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata(null, false)
        ]);
        $this->config->setIsMerchantActive(1, true);
        $this->assertScopeConfig([
            '1' => new ProtectMetadata(null, false)
        ]);
    }

    /** Config::setIsMerchantActive() should deactivate a store with a null token */
    public function testSetIsMerchantActiveWillDectivateWithNullToken(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata(null, true)
        ]);
        $this->config->setIsMerchantActive(1, false);
        $this->assertScopeConfig([
            '1' => new ProtectMetadata(null, false)
        ]);
    }

    /** Config::setIsMerchantActive() should set multiple stores' isActive */
    public function testSetIsMerchantActiveSetsMultiple(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata('foo', false),
            '2' => new ProtectMetadata('bar', true)
        ]);
        $this->config->setIsMerchantActive(1, true);
        $this->config->setIsMerchantActive(2, false);
        $this->assertScopeConfig([
            '1' => new ProtectMetadata('foo', true),
            '2' => new ProtectMetadata('bar', false)
        ]);
    }

    /** Config::isMerchantActive() should return the right store's isActive */
    public function testIsMerchantActiveReturnsCorrect(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata('foo', true),
            '2' => new ProtectMetadata('bar', false)
        ]);
        $this->assertEquals(true, $this->config->isMerchantActive(1));
        $this->assertEquals(false, $this->config->isMerchantActive(2));
    }

    /** Config::isMerchantActive() should return false when passed a non-existent store ID  */
    public function testIsMerchantActiveReturnsFalseWhenNotFound(): void
    {
        $this->assertEquals(false, $this->config->isMerchantActive(1));
    }

    /** Config::initSdkConfiguration() should set the access token in theg sdkConfigManager
     *  to the passed in store's token
     */
    public function testInitSdkConfiguration(): void
    {
        $this->setMetadatas([
            '1' => new ProtectMetadata('foo', true),
            '2' => new ProtectMetadata('bar', false)
        ]);
        $this->config->initSdkConfiguration(true, 1);
        $sdkEnv = SdkConfigManager::getEnvironment();
        $this->assertEquals(
            'foo',
            SdkConfigManager::getValue(sprintf('%s.authorization.access_token', $sdkEnv))
        );
    }

    /**
     * Shortcut for asserting the value in the scopeConfigStore
     * @param ProtectMetadata[]|null $expected
     */
    private function assertScopeConfig(?array $expected): void
    {
        $this->assertEquals(json_encode($expected), $this->scopeConfig->getValue(Config::METADATA_CONFIG_KEY));
    }

    /**
     * Shortcut for setting the value in the scopeConfigStore
     * @param ProtectMetadata[] $metadatas
     */
    private function setMetadatas(array $metadatas): void
    {
        $this->scopeConfigStore = [
            Config::METADATA_CONFIG_KEY => json_encode($metadatas)
        ];
    }
}
