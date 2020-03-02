<?php

namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\UrlInterface;
use Magento\Backend\Model\UrlInterface as BackendUrlInterface;
use Magento\Framework\App\State;
use Magento\Framework\App\Area;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Config\Manager as SdkConfigManager;
use UnexpectedValueException;

/**
 * URL helper class with methods to get all necessary URLs
 */
class Url extends AbstractHelper
{
    /**
     * @var UrlInterface
     */
    protected $url;

    /**
     * @var UrlInterface
     */
    protected $backendUrl;

    /**
     * @var State
     */
    protected $state;

    /**
     * @var Config
     */
    protected $config;

    /**
     * The constructor.
     *
     * @param UrlInterface $url
     * @param BackendUrlInterface $backendUrl
     * @param State $state,
     * @param Config $config
     *
     */
    public function __construct(
        UrlInterface $url,
        BackendUrlInterface $backendUrl,
        State $state,
        Config $config
    ) {
        $this->url = $url;
        $this->backendUrl = $backendUrl;
        $this->state = $state;
        $this->config = $config;
    }

    /**
     * Get the base URL to the Magento Order Detail View
     * This will not include the order id yet as we won't have
     * that until the user clicks on the front end.
     *
     * @return string The URL
     */
    public function getMagentOrderDetailUrl(): string
    {
        $ret = $this->url->getUrl('sales/order/view/order_id');
        $segments = explode('/', $ret);
        // TODO: change this to something more robust.
        // If $ret does not end with the slug `/sales/order/view`, then the alogirthm is wrong
        $segments = array_splice($segments, 0, -3);
        // TODO: this needs to be more robust. Circle back and bullet proof this with backing tests.
        $ret = join('/', $segments) . '/order_id';
        return $ret;
    }

    /**
     * Get the URL to the Session Data route
     * Called by the front-end to add things like
     * screenHeight and screenWidth to Session Data
     *
     * @return string The URL
     */
    public function getMagentoNS8SessionDataUrl(): string
    {
        $sessionDataUrl = $this->url->getUrl('ns8protect/sessiondata');
        if ($this->state->getAreaCode() == Area::AREA_ADMINHTML) {
            $sessionDataUrl = $this->backendUrl->getUrl('ns8protectadmin/sessiondata');
        }

        return $sessionDataUrl;
    }

    /**
     * Get the URL of the iframe that holds the NS8 Protect client.
     *
     * @param array $params The query parameters
     *
     * @return string The URL
     */
    public function getNS8IframeUrl(array $params = []): string
    {
        unset($params['key']);

        return $this->url->getUrl('ns8protectadmin/sales/dashboard', $params);
    }

    /**
     * Get the URL of the protect-sdk-js bundle
     *
     * @return string The URL
     */
    public function getProtectJsSdkUrl(): string
    {
        return SdkConfigManager::getEnvValue('urls.js_sdk');
    }

    public function getClientUrl(): string
    {
        return SdkConfigManager::getEnvValue('urls.client_url');
    }
}
