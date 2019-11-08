<?php

namespace NS8\Protect\Helper;

use Exception;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\UrlInterface;
use NS8\Protect\Helper\Config;
use UnexpectedValueException;

/**
 * URL helper class with methods to get all necessary URLs
 */
class Url extends AbstractHelper
{
    /**
     * The URL to the Development Protect API
     */
    const NS8_DEV_URL_API = 'http://magento-v2-api.ngrok.io';
    /**
     * The URL to the Development Client API
     */
    const NS8_DEV_URL_CLIENT = 'http://magento-v2-client.ngrok.io';

    /**
     * The URL to the Production Protect API
     */
    const NS8_PRODUCTION_URL_API = 'https://protect.ns8.com';

    /**
     * The URL to the Production Client API
     */
    const NS8_PRODUCTION_URL_CLIENT = 'https://protect-client.ns8.com';

    /**
     * @var Config
     */
    protected $config;

    /**
     * @var RequestInterface
     */
    protected $request;

    /**
     * @var UrlInterface
     */
    protected $url;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param RequestInterface $request
     * @param UrlInterface $url
     */
    public function __construct(
        Config $config,
        RequestInterface $request,
        UrlInterface $url
    ) {
        $this->config = $config;
        $this->request = $request;
        $this->url = $url;
    }

    /**
     * Assembles the URL using environment variables and handles parsing extra `/`
     *
     * @param string $envVarName
     * @param string $defaultUrl
     * @param string $route
     * @return string The final URL
     */
    private function getNS8Url(string $envVarName, string $defaultUrl, string $route = '') : string
    {
        $url = $this->config->getEnvironmentVariable($envVarName) ?: '';
        $url = trim($url);

        if (substr($url, -1) === '/') {
            $url = substr($url, 0, -1);
        }

        if (empty($url)) {
            $url = $defaultUrl;
        }
        if ($url === Url::NS8_PRODUCTION_URL_API ||
            $url === Url::NS8_PRODUCTION_URL_CLIENT) {
            throw new UnexpectedValueException('Cannot use Production URLs right now.');
        }
        if (!empty($route)) {
            $route = trim($route);
            if (substr($route, -1) === '/') {
                $route = substr($route, 0, -1);
            }
            if (substr($route, 0, 1) === '/') {
                $route = substr($route, 1);
            }
            $url = $url.'/'.$route;
        }
        return $url;
    }

    /**
     * Gets the current protect API URL based on the environment variables.
     * For now, defaults to Development.
     * @todo Revisit defaults on preparation to release to Production
     *
     * @param string $route
     * @return string The NS8 Protect URL in use for this instance.
     */
    public function getApiBaseUrl(string $route = '') : string
    {
        return $this->getNS8Url(Config::NS8_ENV_NAME_API_URL, self::NS8_DEV_URL_API, $route);
    }

    /**
     * Gets the current protect Client URL based on the environment variables.
     * For now, defaults to Development.
     * @todo Revisit defaults on preparation to release to Production
     *
     * @param string $route
     * @return string The NS8 Protect Client URL in use for this instance.
     */
    public function getNS8ClientUrl(string $route = '') : string
    {
        return $this->getNS8Url(Config::NS8_ENV_NAME_CLIENT_URL, self::NS8_DEV_URL_CLIENT, $route);
    }

    /**
     * Get the NS8 client order URL. If the order_id parameter is specified in the URL,
     * then point to that specific order. Otherwise, just point to the main dashboard page.
     * @param string|null $orderIncrementId
     * @return string The URL
     */
    public function getNS8ClientOrderUrl(string $orderIncrementId = null): string
    {
        return sprintf(
            '%s%s?access_token=%s',
            $this->getNS8ClientUrl(),
            isset($orderIncrementId) ? '/order-details/' . $this->base64UrlEncode($orderIncrementId) : '',
            $this->config->getAccessToken()
        );
    }

    /**
     * Gets the current protect Middleware URL based on the environment variables.
     * For now, defaults to Development.
     * @todo Revisit defaults on preparation to release to Production
     *
     * @param string $route
     * @return string The NS8 Protect Middleware URL in use for this instance.
     */
    public function getNS8MiddlewareUrl(string $route = '') : string
    {
        if (substr($route, 0, 1) === '/') {
            $route = substr($route, 1);
        }
        $routeSlug = 'api'.'/'.$route;
        return $this->getNS8Url(Config::NS8_ENV_NAME_CLIENT_URL, self::NS8_DEV_URL_CLIENT, $routeSlug);
    }

    /**
     * Get the URL of the iframe that holds the NS8 Protect client.
     * @param string|null $orderId
     * @return string The URL
     */
    public function getNS8IframeUrl(string $orderId = null): string
    {
        $orderId = $orderId ?: $this->request->getParam('order_id');
        return $this->url->getUrl('ns8protectadmin/sales/dashboard', isset($orderId) ? ['order_id' => $orderId] : []);
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
        $ret = join('/', $segments);
        return $ret;
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
}
