<?php
namespace NS8\Protect\Helper;

use Magento\Backend\Model\Auth\Session;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\Acl\AclResource\ProviderInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\StoreFactory;
use Magento\Store\Model\StoreManagerInterface;

class Store extends AbstractHelper
{
    /**
     * @var AuthorizationInterface
     */
    private $authorization;

    /**
     * @var Context
     */
    protected $context;

     /**
      * Acl resource config
      *
      * @var ProviderInterface
      */
    protected $resourceProvider;

    /**
     * @var StoreFactory
     */
    protected $storeFactory;

    /**
     * @var StoreManagerInterface
     */
    protected $storeManager;

    protected $session;

    /**
     * Default constructor
     *
     * @param Context $context
     * @param StoreFactory $storeFactory
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        AuthorizationInterface $authorization,
        Context $context,
        ProviderInterface $resourceProvider,
        StoreFactory $storeFactory,
        StoreManagerInterface $storeManager,
        Session $session
    ) {
        $this->authorization = $authorization;
        $this->resourceProvider = $resourceProvider;
        $this->storeFactory = $storeFactory;
        $this->storeManager = $storeManager;
        $this->session = $session;
        parent::__construct($context);
    }

    /**
     *  formats a single store into a more succinct and usable array
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
        $storeArray = $this->parseStores($storeManagerDataList);
        $this->filterstoreArrayByPermission($storeArray);
        return $storeArray;
    }
 
    /**
     * Returns an array of strores accessible by the user
     * @param mixed[] $storeArray - The array of stores we want to filter
     *
     * @return mixed[] The filtered array of stores
     */
    public function filterstoreArrayByPermission(array $storeArray): array
    {
        $user = $this->session->getUser();
        $multistorePermissionAvailable = $user->getRole()->getGwsIsAll() !== null;
        if (!$multistorePermissionAvailable) {
            return $storeArray;
        }

        $accessibleStores = (array) $user->getRole()->getGwsWebsites();
        return array_filter($storeArray, function ($store) use ($accessibleStores) {
            return in_array($store['id'], $accessibleStores);
        });
    }

    /**
     * get the current store from the storeManager
     */
    public function getCurrentStore(): array
    {
        return $this->parseStore($this->storeManager->getStore());
    }
}
