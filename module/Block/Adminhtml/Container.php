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
     * @param IntegrationServiceInterface $integrationService The integration service
     * @param Order $order The order helper
     * @param PageFactory $resultPageFactory The page factory
     * @param Url $url URL helper class
     */
    public function __construct(
        Context $context,
        Http $request,
        IntegrationServiceInterface $integrationService,
        Order $order,
        PageFactory $resultPageFactory,
        Url $url
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->integrationService = $integrationService;
        $this->order = $order;
        $this->request = $request;
        $this->resultPageFactory = $resultPageFactory;
        $this->url = $url;
    }

    /**
     * Get the URL of the iframe that holds the NS8 Protect client.
     *
     * @return string The URL
     */
    public function getNS8ProtectUrl(): string
    {
        $orderId = $this->request->getParam('order_id');
        $orderIncrementId = $orderId ? $this->order->getOrderIncrementId($orderId) : null;
        $page = $orderIncrementId ? 'order_details' : $this->request->getParam('page');

        return $this->url->getNS8ClientPageUrl($page, $orderIncrementId);
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
