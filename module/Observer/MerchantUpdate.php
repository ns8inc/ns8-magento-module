<?php

namespace NS8\CSP2\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\App\Request\Http;
use Magento\Customer\Model\Session;

use NS8\CSP2\Helper\Logger;
use NS8\CSP2\Helper\HttpClient;

class MerchantUpdate implements ObserverInterface
{
    protected $request;
    protected $customerSession;
    protected $logger;
    protected $httpClient;

    /**
     * Default constructor
     *
     * @param Http $request
     * @param Session $session
     * @param Logger $logger
     * @param HttpClient $httpClient
     */
    public function __construct(
        Http $request,
        Session $session,
        Logger $logger,
        HttpClient $httpClient
    ) {
        $this->request = $request;
        $this->customerSession = $session;
        $this->logger = $logger;
        $this->httpClient = $httpClient;
    }

    /**
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        try {
            $eventData = $observer->getEvent()->getData();
        } catch (\Exception $e) {
            $this->logger->error('The event data could not be retrieved', $e);
            return;
        }

        $params = ['action' => 'UPDATE_MERCHANT_ACTION'];
        $data = ['eventData' => $eventData];

        try {
            $this->httpClient->post('/switch/executor', $data, $params);
        } catch (\Exception $e) {
            $this->logger->error('The merchant update could not be processed', $e);
        }
    }
}
