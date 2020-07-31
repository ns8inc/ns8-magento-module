<?php

namespace NS8\Protect\Block\Adminhtml;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Store;
use NS8\Protect\Helper\Url;

/**
 * Provides access to DI and helper methods for the store_select template
 */
class StoreSelect extends Template
{
    /** @var Config */
    protected $config;

    /** @var Url */
    public $url;

    /** @var Store */
    private $storeHelper;

    /**
     * Constructor
     * @param Context $context The context
     * @param Config $config Config helper
     * @param Url $url Url helper
     * @param Store $storeHelper Store helper
     */
    public function __construct(
        Context $context,
        Config $config,
        Url $url,
        Store $storeHelper
    ) {
        $this->config = $config;
        $this->url = $url;
        $this->storeHelper = $storeHelper;
        parent::__construct($context);
    }

    /**
     * Gets a limited set of attributes for each store the user has access to.
     * Safe to include on front-end as JSON.
     * @return array[]
     */
    public function getStores(): array
    {
        $stores = $this->storeHelper->getUserStores();
        return array_map(function ($store) {
            return [
                "id" => $store["id"],
                "active" => $this->config->isMerchantActive((int) $store["id"]),
                "name" => $store["name"],
                "token" => $this->config->getAccessToken((int) $store["id"])
            ];
        }, array_filter($stores, function ($store) {
            return $store["active"];
        }));
    }
}
