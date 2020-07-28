<?php
namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\StoreFactory;
use Magento\Store\Model\StoreManagerInterface;

class Store extends AbstractHelper
{
    /**
     * @var Context
     */
    protected $context;

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
     * @param StoreFactory $storeFactory
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Context $context,
        StoreFactory $storeFactory,
        StoreManagerInterface $storeManager
    ) {
        $this->storeFactory = $storeFactory;
        $this->storeManager = $storeManager;
        parent::__construct($context);
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
            $stores[] = [
                'name'  => $value->getName(),
                'code'  => $value->getCode(),
                'id'    => $value->getStoreId(),
                'url'   => $value->getBaseUrl(),
                'active' => $value->isActive()
            ];
        }
        return $stores;
    }

    /**
     * get all stores
     *
     * @return array
     */
    public function getAllStores(): array
    {
        $storeCollection = $this->storeFactory->create()->getCollection();
        return $this->parseStores($storeCollection);
    }

    /**
     * get all stores under a website
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
}
