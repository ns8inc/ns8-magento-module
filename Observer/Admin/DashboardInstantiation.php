<?php
namespace NS8\Protect\Observer\Admin;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Setup;

/**
 * Responds to Dashboard init events
 */
class DashboardInstantiation implements ObserverInterface
{
    /**
     * The  config manager
     *
     * @var Config
     */
    protected $config;
    /**
     * Store manager attribute to fetch store data
     *
     * @var StoreManagerInterface
     */
    protected $storeManager;
    /**
     * Setup Helper attribute to activate a shop
     *
     * @var Setup
     */
    protected $setupHelper;
    /**
     * Default constructor
     *
     * @param Config $config
     * @param Setup $setupHelper
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        Config $config,
        Setup $setupHelper,
        StoreManagerInterface $storeManager
    ) {
        $this->config = $config;
        $this->storeManager = $storeManager;
        $this->setupHelper = $setupHelper;
        $this->config->initSdkConfiguration();
    }

    /**
     * If a shop is not activated, call the activate function, otherwise yield to dashboard
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer) : void
    {
        $event = $observer->getEvent()->getData();
        $store = $this->storeManager->getStore($event['storeId']);
        if ($store === null) {
            $store = $this->storeManager->getStore();
        }
        $meta = $this->config->getStoreMetadata($store->getStoreId());
        if ($meta && $meta->isActive && $meta->token) {
            return;
        }
        $this->setupHelper->activateShop($store->getStoreId());
    }
}
