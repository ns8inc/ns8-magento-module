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
        return $this->httpClient->getEQ8Score();
    }

    /**
     * Get the NS8 client URL. If the order_id parameter is specified in the URL, then point to that specific order.
     * Otherwise, just point to the main dashboard page.
     *
     * @return string The URL
     */
    public function getNS8ClientOrderUrl(): string
    {
        return $this->configHelper->getNS8ClientOrderUrl();
    }

    /**
     * Get the URL of the iframe that holds the NS8 Protect client.
     *
     * @return string The URL
     */
    public function getNS8IframeUrl(): string
    {
        return $this->configHelper->getNS8IframeUrl($this->request->getParam('order_id'));
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
        return $this->getUrl('sales/order/view/order_id');
    }
}
