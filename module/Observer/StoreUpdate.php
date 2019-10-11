<?php

namespace NS8\CSP2\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\App\Request\Http;
use Magento\Customer\Model\Session;
use Magento\Store\Api\Data\StoreInterface;

use NS8\CSP2\Helper\Logger;
use NS8\CSP2\Helper\HttpClient;

class StoreUpdate implements ObserverInterface
{
    protected $request;
    protected $customerSession;
    protected $logger;
    protected $store;
    protected $httpClient;

    /**
     * Default constructor
     *
     * @param Http $request
     * @param Session $session
     * @param Logger $logger
     * @param StoreInterface $store
     */
    public function __construct(
        Http $request,
        Session $session,
        Logger $logger,
        StoreInterface $store,
        HttpClient $httpClient
    ) {
        $this->customerSession = $session;
        $this->logger = $logger;
        $this->request = $request;
        $this->order = $store;
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
        $params = ['action' => 'UPDATE_MERCHANT_ACTION'];

        try {
            $data = ['store' => $observer->getEvent()->getStore()->getData()];
        } catch (\Exception $e) {
            $this->logger->error('The store data could not be retrieved', $e);
        }

        try {
            $this->httpClient->post('protect/executor', $data, $params);
        } catch (\Exception $e) {
            $this->logger->error('The merchant update could not be processed', $e);
        }
    }
}
