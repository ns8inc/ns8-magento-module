<?php

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */

declare(strict_types=1);

namespace NS8\Protect\Block\Frontend;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Framework\App\Config\ScopeConfigInterface;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Http\Client as HttpClient;

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
      * The constructor.
      *
      * @param Context $context The Magento context
      * @param Config $config The Config Helper attribute
      * @param ScopeConfigInterface $scopeConfig
      * @param array $data The data to pass to the Template constructor (optional)
      */
    public function __construct(Context $context, Config $config, ScopeConfigInterface $scopeConfig, array $data = [])
    {
        parent::__construct($context, $data);
        $this->config = $config;
        $this->scopeConfig = $scopeConfig;
    }

    /**
     * Get the TrueStats tracking script (wrapped in HTML <script> tags).
     *
     * @return string The tracking script
     */
    public function getScriptHtml(): string
    {
        $existingAccessToken = $this->scopeConfig->getValue('ns8/protect/token');
        if (empty($existingAccessToken)) {
            return '';
        }

        $this->config->initSdkConfiguration();
        $script = (new HttpClient())->sendNonObjectRequest('/init/script');

        // Call json_decode to remove quotes if present
        return is_string($script) ? sprintf('<script>%s</script>', json_decode($script)) : '';
    }
}
