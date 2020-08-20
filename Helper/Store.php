<?php
namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\App\Request\Http;
use Magento\Store\Model\StoreFactory;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;

class Store extends AbstractHelper
{
    /**
     * @var Context
     */
    protected $context;

    /**
     * @var Config
     */
    protected $configHelper;

    /**
     * @var StoreFactory
     */
    protected $storeFactory;

    /**
     * @var StoreManagerInterface
     */
    protected $storeManager;

    /**
     * Default constructor
     *
     * @param Context $context
     * @param Config $configHelper
     * @param Http $request
     * @param StoreFactory $storeFactory
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Context $context,
        Config $configHelper,
        Http $request,
        StoreFactory $storeFactory,
        StoreManagerInterface $storeManager
    ) {
        $this->configHelper = $configHelper;
        $this->request = $request;
        $this->storeFactory = $storeFactory;
        $this->storeManager = $storeManager;
        parent::__construct($context);
    }

    /**
     * Formats a single store into a more succinct and usable array
     * @param Store $store
     * @return array
     */
    private function parseStore($store): array
    {
        return [
            'name'  => $store->getName(),
            'code'  => $store->getCode(),
            'id'    => $store->getStoreId(),
            'url'   => $store->getBaseUrl(),
            'active' => $store->isActive()
        ];
    }

    /**
     * Formats store collections into a more succinct and usable array
     * @param array $storeCollection
     * @return array
     */
    private function parseStores($storeCollection): array
    {
        $stores = [];
        foreach ($storeCollection as $value) {
            $stores[] = $this->parseStore($value);
        }
        return $stores;
    }

    /**
     * Get all stores
     *
     * @return array
     */
    public function getAllStores(): array
    {
        $storeCollection = $this->storeFactory->create()->getCollection();
        return $this->parseStores($storeCollection);
    }

    /**
     * Get all stores under a website
     * @param int $websiteId - the id if the desired website
     * @return array
     */
    public function getStoresByWebsite($websiteId): array
    {
        $storeCollection = $this->storeFactory->create()->getCollection()->addWebsiteFilter($websiteId);
        return $this->parseStores($storeCollection);
    }

    /**
     * Retrieve a list of stores that the user has access to
     *
     * @return array $stores a list of stores the user has access to
     */
    public function getUserStores(): array
    {
        $storeManagerDataList = $this->storeManager->getStores();
        return $this->parseStores($storeManagerDataList);
    }

    /**
     * get the current store from the storeManager
     */
    public function getCurrentStore(): array
    {
        return $this->parseStore($this->storeManager->getStore());
    }

    /**
     * Gets a limited set of attributes for each store the user has access to.
     * Safe to include on front-end as JSON.
     * @return array[]
     */
    public function getDisplayStores(): array
    {
        $stores = $this->getUserStores();
        return array_map(function ($store) {
            return [
                'id' => $store['id'],
                'active' => $this->configHelper->isMerchantActive((int) $store['id']),
                'name' => $store['name'],
                'token' => $this->configHelper->getAccessToken((int) $store['id']),
            ];
        }, array_filter($stores, function ($store) {
            return $store['active'];
        }));
    }

    /**
     * Returns the Store ID we want to show initially in the UI
     *
     * @return int - The Store ID we want to show the UI for
     */
    public function getRequestedStoreId(): int
    {
        $storeArray = $this->getDisplayStores();
        $availableStoreIds = array_map(function ($store) {
            return (int) $store['id'];
        }, $storeArray);

        $requestedStoreId = (int) $this->request->getParam('store_id');
        if (in_array($requestedStoreId, $availableStoreIds)) {
            return $requestedStoreId;
        }
        return $availableStoreIds[0];
    }
}
