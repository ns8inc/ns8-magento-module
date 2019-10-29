<?php

/**
 * The Verify Order class.
 *
 * This handles the verification of orders (via email links).
 */
declare(strict_types=1);

namespace NS8\CSP2\Block\Frontend;

use \Exception;
use Magento\Framework\App\Request\Http;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use NS8\CSP2\Helper\HttpClient;

/**
 * The Verify Order class.
 *
 * This handles the verification of orders (via email links).
 */
class VerifyOrder extends Template
{
    /**
     * The HTTP client helper.
     *
     * @var HttpClient
     */
    private $httpClient;

    /**
     * The HTTP request.
     *
     * @var Http
     */
    private $request;

    /**
     * The constructor.
     *
     * @param Context $context The Magento context
     * @param HttpClient $httpClient The HTTP client
     * @param Http $request The HTTP request
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(
        Context $context,
        HttpClient $httpClient,
        Http $request,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->httpClient = $httpClient;
        $this->request = $request;
    }

    /**
     * Makes a call to NS8 Protect API to either approve or cancel the order.
     *
     * @return string The new order status if it was successfully changed, null otherwise.
     */
    public function updateOrderStatus(): ?string {
        $orderId = $this->request->getParam('orderId');
        $newStatus = ($this->request->getParam('view') === 'orders-validate') ? 'APPROVED' : 'CANCELLED';
        $response = $this->httpClient->put(sprintf('orders/%s', $orderId), ['status' => $newStatus]);

        if (isset($response->status) && is_string($response->status)) {
            return $response->status;
        }

        return null;
    }
}
