<?php

declare(strict_types=1);

namespace NS8\Protect\Test;

use Magento\Framework\TestFramework\Unit\Helper\ObjectManager;
use Magento\Store\Model\ResourceModel\Store\Collection;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\StoreFactory;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Store\Model\Store;
use NS8\Protect\Helper\Store as StoreHelper;
use PHPUnit\Framework\TestCase;
use Zend\Uri\Uri;

/**
 * Tests for Helper\Store.php
 */
class StoreTest extends TestCase
{
    /** @var StoreHelper */
    private $store;

    /** @var array */
    private $store1;

    /** @var array */
    private $store2;

    public function setUp(): void
    {
        $objectManager = new ObjectManager($this);

        /** @var Context */
        $context = $this->createMock(Context::class);

        $store1 = [
            'name'  => 'store1',
            'code'  => 's1',
            'id'    => 1,
            'url'   => 'store1.com',
            'active' => true
        ];

        $store2 = [
            'name'  => 'store2',
            'code'  => 's2',
            'id'    => 2,
            'url'   => 'store2.com',
            'active' => true
        ];

        $store1Mock = $this->getMockBuilder(Store::class)
            ->setMethods(['getName', 'getCode', 'getStoreId', 'getBaseUrl', 'isActive',])
            ->disableOriginalConstructor()
            ->getMock();
        $store1Mock->method('getName')->willReturn($store1['name']);
        $store1Mock->method('getCode')->willReturn($store1['code']);
        $store1Mock->method('getStoreId')->willReturn($store1['id']);
        $store1Mock->method('getBaseUrl')->willReturn($store1['url']);
        $store1Mock->method('isActive')->willReturn($store1['active']);

        $store2Mock = $this->getMockBuilder(Store::class)
            ->setMethods(['getName', 'getCode', 'getStoreId', 'getBaseUrl', 'isActive'])
            ->disableOriginalConstructor()
            ->getMock();
        $store2Mock->method('getName')->willReturn($store2['name']);
        $store2Mock->method('getCode')->willReturn($store2['code']);
        $store2Mock->method('getStoreId')->willReturn($store2['id']);
        $store2Mock->method('getBaseUrl')->willReturn($store2['url']);
        $store2Mock->method('isActive')->willReturn($store2['active']);

        $storeCollectionMock = $objectManager->getCollectionMock(Collection::class, [$store1Mock, $store2Mock]);
        $storeCollectionMock->method('addWebsiteFilter')->willReturn([$store1Mock]);

        $storeMock = $this->getMockBuilder(Store::class)
        ->setMethods(['getCollection'])
        ->disableOriginalConstructor()
        ->getMock();
        $storeMock->method('getCollection')->willReturn($storeCollectionMock);

        $storeManagerTemp = $this->createMock(StoreManagerInterface::class);
        $storeManagerTemp->method('getStores')->willReturn($storeCollectionMock);
        /** @var StoreManagerInterface */
        $storeManager = $storeManagerTemp;

        $storeFactoryTemp = $this->createMock(StoreFactory::class);
        $storeFactoryTemp->method('create')->willReturn($storeMock);
        $storeFactory = $storeFactoryTemp;

        $this->store1 = $store1;
        $this->store2 = $store2;

        $this->store = new StoreHelper(
            $context,
            $storeFactory,
            $storeManager
        );
    }

    public function tearDown(): void
    {
        $this->store1 = null;
        $this->store2 = null;
        $this->store = null;
    }

    /**
     *  Store::getUserStores() should return all stores in the collection
     */
    public function testGetUserStores(): void
    {
        $this->assertEquals(
            [
                $this->store1, $this->store2
            ],
            $this->store->getUserStores()
        );
    }

    /**
     * Store::getStoresByWebsite should return only the first store
     */
    public function testGetStoresByWebsite(): void
    {
        $this->assertEquals(
            [$this->store1],
            $this->store->getStoresByWebsite(1)
        );
    }

    /**
     * Store::getAllStores should return all stores in the collection
     */
    public function testGetAllStores(): void
    {
        $this->assertEquals(
            [
                $this->store1, $this->store2
            ],
            $this->store->getAllStores()
        );
    }
}
