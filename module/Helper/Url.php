<?php

namespace NS8\Protect\Helper;

use Exception;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\UrlInterface;
use Magento\Backend\Model\UrlInterface as BackendUrlInterface;
use Magento\Framework\App\State;
use Magento\Framework\App\Area;
use NS8\Protect\Helper\Config;
use UnexpectedValueException;

/**
 * URL helper class with methods to get all necessary URLs
 */
class Url extends AbstractHelper
{
    /**
     * @var Config
     */
    protected $config;

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
     * The constructor.
     *
     * @param Config $config
     * @param UrlInterface $url
     * @param BackendUrlInterface $backendUrl
     * @param State $state
     *
     */
    public function __construct(
        Config $config,
        UrlInterface $url,
        BackendUrlInterface $backendUrl,
        State $state
    ) {
        $this->config = $config;
        $this->url = $url;
        $this->backendUrl = $backendUrl;
        $this->state = $state;
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
     * Encode a string using base64 in URL mode.
     *
     * @link https://en.wikipedia.org/wiki/Base64#URL_applications
     *
     * @param string $data The data to encode
     *
     * @return string The encoded string
     */
    public function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Get the NS8 client page URL.
     *
     * @param string|null $page The page to visit inside the iframe (defaults to the dashboard)
     * @param string|null $orderIncrementId The order increment ID (if visiting the order details page)
     *
     * @throws UnexpectedValueException If an unknown page was requested.
     *
     * @return string The URL
     */
    public function getNS8ClientPageUrl(?string $page, ?string $orderIncrementId): string
    {
        $query = ['accessToken' => $this->config->getAccessToken()];

        switch ($page) {
            case null:
            case 'dashboard':
                $route = '';
                $query['noredirect'] = 1;
                break;
            case 'order_details':
                $route = 'order-details/' . $this->base64UrlEncode($orderIncrementId);
                break;
            case 'order_rules':
                $route = 'rules';
                break;
            case 'suspicious_orders':
                $route = 'report/suspicious-orders';
                break;
            default:
                throw new UnexpectedValueException('Unrecognized page requested: ' . $page);
        }

        return sprintf(
            '%s?%s',
            $this->config->getNS8Url($route),
            http_build_query($query)
        );
    }
}
