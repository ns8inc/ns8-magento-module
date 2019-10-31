<?php

/**
 * The Container class.
 *
 * This handles the Magento data and allows it to be retrieved by the view templates.
 */
declare(strict_types=1);

namespace NS8\Protect\Block\Adminhtml;

use Magento\Backend\Block\Template;
use Magento\Backend\Block\Template\Context;
use Magento\Framework\App\Request\Http;
use Magento\Framework\View\Result\PageFactory;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;

/**
 * The Container class.
 *
 * This handles the Magento data and allows it to be retrieved by the view templates.
 */
class Container extends Template
{
    /**
     * The config helper.
     *
     * @var Config
     */
    private $configHelper;

    /**
     * The context.
     *
     * @var Context
     */
    private $context;

    /**
     * The HTTP client helper.
     *
     * @var HttpClient
     */
    private $httpClient;

    /**
     * The request.
     *
     * @var Http
     */
    private $request;

    /**
     * The page factory.
     *
     * @var PageFactory
     */
    private $resultPageFactory;

    /**
     * Constructor
     *
     * @param Config $configHelper The config helper
     * @param Context $context The context
     * @param HttpClient $httpClient The HTTP client
     * @param Http $request The request
     * @param PageFactory $resultPageFactory The page factory
     */
    public function __construct(
        Config $configHelper,
        Context $context,
        HttpClient $httpClient,
        Http $request,
        PageFactory $resultPageFactory
    ) {
        parent::__construct($context);
        $this->configHelper = $configHelper;
        $this->context = $context;
        $this->httpClient = $httpClient;
        $this->request = $request;
        $this->resultPageFactory = $resultPageFactory;
    }

    /**
     * Get the NS8 Protect Client Access Token.
     *
     * @return string The access token
     */
    public function getAccessToken(): string
    {
        return $this->configHelper->getAccessToken();
    }

    /**
     * Get the NS8 EQ8 score for the order.
     *
     * @return int|null The EQ8 score
     */
    public function getEQ8Score(): ?int
    {
        $orderIncrementId = $this->configHelper->getOrderIncrementId();
        $uri = sprintf('/orders/order-name/%s', $this->base64UrlEncode($orderIncrementId));
        $req = $this->httpClient->get($uri);

        if (!isset($req->fraudAssessments)) {
            return null;
        }

        // The goal here is to look in the fraudAssessments array and return the first score we find that's an EQ8.
        return array_reduce($req->fraudAssessments, function (?int $foundScore, \stdClass $fraudAssessment): ?int {
            if (!empty($foundScore)) {
                return $foundScore;
            }

            return $fraudAssessment->providerType === 'EQ8' ? $fraudAssessment->score : null;
        });
    }

    /**
     * Get the NS8 client URL. If the order_id parameter is specified in the URL, then point to that specific order.
     * Otherwise, just point to the main dashboard page.
     *
     * @return string The URL
     */
    public function getNS8ClientUrl(): string
    {
        $orderIncrementId = $this->configHelper->getOrderIncrementId();
        return sprintf(
            '%s%s?access_token=%s',
            $this->configHelper->getNS8ClientUrl(),
            isset($orderIncrementId) ? '/order-details/' . $this->base64UrlEncode($orderIncrementId) : '',
            $this->getAccessToken()
        );
    }

    /**
     * Get the URL of the iframe that holds the NS8 Protect client.
     *
     * @return string The URL
     */
    public function getNS8IframeUrl(): string
    {
        $orderId = $this->request->getParam('order_id');

        return $this->getUrl('ns8protectadmin/sales/dashboard', isset($orderId) ? ['order_id' => $orderId] : []);
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
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
