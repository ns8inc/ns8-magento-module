<?php
namespace NS8\Protect\Observer\Admin;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Setup;
use NS8\Protect\Helper\Store;

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
     * Setup Helper attribute to activate a shop
     *
     * @var Setup
     */
    protected $setupHelper;

    /**
     * Store helper attribute to fetch store data
     *
     * @var Store
     */
    protected $storeHelper;

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
        Store $storeHelper
    ) {
        $this->config = $config;
        $this->storeHelper = $storeHelper;
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
        $storeId = $this->storeHelper->getRequestedStoreId();
        $meta = $this->config->getStoreMetadata($storeId);
        if ($meta && $meta->isActive && $meta->token) {
            return;
        }
        $this->setupHelper->activateShop($storeId);
    }
}
