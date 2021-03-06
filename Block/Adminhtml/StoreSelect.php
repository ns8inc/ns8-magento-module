<?php

namespace NS8\Protect\Block\Adminhtml;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Framework\App\Request\Http;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Order;
use NS8\Protect\Helper\Store;
use NS8\Protect\Helper\Url;

/**
 * Provides access to DI and helper methods for the store_select template
 */
class StoreSelect extends Template
{
    /** @var Config */
    protected $config;

    /**
     * The order helper.
     *
     * @var Order
     */
    public $order;

    /** @var Url */
    public $url;

    /** @var Store */
    public $storeHelper;

    /**
     * The request.
     *
     * @var Http
     */
    public $request;
    /**
     * Constructor
     * @param Context $context The context
     * @param Config $config Config helper
     * @param Url $url Url helper
     * @param Http $request request object
     * @param Order $order The order helper
     * @param Store $storeHelper Store helper
     */
    public function __construct(
        Context $context,
        Config $config,
        Http $request,
        Order $order,
        Store $storeHelper,
        Url $url
    ) {
        $this->config = $config;
        $this->order = $order;
        $this->storeHelper = $storeHelper;
        $this->request = $request;
        $this->url = $url;
        parent::__construct($context);
    }

     /**
      * Returns the Store ID we want to show initially in the UI
      *
      * @return int - The Store ID we want to show the UI for
      */
    public function getRequestedStore(): int
    {
        return $this->storeHelper->getRequestedStoreId();
    }

    /**
     * Gets a limited set of attributes for each store the user has access to.
     * Safe to include on front-end as JSON.
     * @return array[]
     */
    public function getStores(): array
    {
        return $this->storeHelper->getDisplayStores();
    }
}
