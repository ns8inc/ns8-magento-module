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
use Magento\Integration\Api\IntegrationServiceInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Order;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Url;

/**
 * The Container class.
 *
 * This handles the Magento data and allows it to be retrieved by the view templates.
 */
class Container extends Template
{
    /**
     * The order helper.
     *
     * @var Order
     */
    public $order;

    /**
     * The context.
     *
     * @var Context
     */
    protected $context;

    /**
     * The HTTP client helper.
     *
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * The integration service.
     *
     * @var IntegrationServiceInterface
     */
    protected $integrationService;

    /**
     * The request.
     *
     * @var Http
     */
    protected $request;

    /**
     * The page factory.
     *
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * The URL Helper class
     *
     * @var Url
     */
    public $url;

    /**
     * Constructor
     *
     * @param Context $context The context
     * @param Http $request The request
     * @param HttpClient $httpClient The HTTP client
     * @param IntegrationServiceInterface $integrationService The integration service
     * @param Order $order The order helper
     * @param PageFactory $resultPageFactory The page factory
     * @param Url $url URL helper class
     */
    public function __construct(
        Context $context,
        Http $request,
        HttpClient $httpClient,
        IntegrationServiceInterface $integrationService,
        Order $order,
        PageFactory $resultPageFactory,
        Url $url
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->httpClient = $httpClient;
        $this->integrationService = $integrationService;
        $this->order = $order;
        $this->request = $request;
        $this->resultPageFactory = $resultPageFactory;
        $this->url = $url;
    }

    /**
     * Check whether the NS8 Protect extension is activated.
     *
     * @return bool True if activated, False otherwise.
     */
    public function isActivated(): bool
    {
        $integration = $this->integrationService->findByName(Config::NS8_INTEGRATION_NAME);

        return $integration->getStatus() === $integration::STATUS_ACTIVE;
    }
}
