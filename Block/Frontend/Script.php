<?php

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */

declare(strict_types=1);

namespace NS8\Protect\Block\Frontend;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Store\Model\StoreManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Analytics\Client as AnalyticsClient;

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */
class Script extends Template
{
    /**
     * @var Config
     */
    protected $config;

    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var StoreManagerInterface
     */
    protected $storeManager;

     /**
      * The constructor.
      *
      * @param Context $context The Magento context
      * @param Config $config The Config Helper attribute
      * @param ScopeConfigInterface $scopeConfig The scope config
      * @param StoreManagerInterface $storeManager The store manager
      * @param array $data The data to pass to the Template constructor (optional)
      */
    public function __construct(
        Context $context,
        Config $config,
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->config = $config;
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;
    }

    /**
     * Get the TrueStats tracking script (wrapped in HTML <script> tags).
     *
     * @return string The tracking script
     */
    public function getScriptHtml(): string
    {
        $storeId = (int)$this->storeManager->getStore()->getId();

        if (!$this->config->isMerchantActive($storeId)) {
            return '';
        }

        $this->config->initSdkConfiguration(true, $storeId);
        $script = AnalyticsClient::getTrueStatsScript();

        return is_string($script) ? sprintf('<script>%s</script>', $script) : '';
    }
}
