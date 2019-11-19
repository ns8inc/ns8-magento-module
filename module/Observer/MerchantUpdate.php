<?php

namespace NS8\Protect\Observer;

use Exception;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Logger;
use NS8\Protect\Helper\SwitchActionType;

/**
 * Responds to merchant update events
 */
class MerchantUpdate implements ObserverInterface
{
    /**
     * @var Session
     */
    protected $customerSession;

    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * @var Http
     */
    protected $request;

    /**
     * Default constructor
     *
     * @param Http $request
     * @param HttpClient $httpClient
     * @param Logger $logger
     * @param Session $session
     */
    public function __construct(
        Http $request,
        HttpClient $httpClient,
        Logger $logger,
        Session $session
    ) {
        $this->customerSession = $session;
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->request = $request;
    }

    /**
     * Observer execute method
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer) : void
    {
        try {
            $eventData = $observer->getEvent()->getData();
        } catch (Exception $e) {
            $this->logger->error('The event data could not be retrieved', ['error' => $e]);
            return;
        }

        $params = ['action' => SwitchActionType::UPDATE_MERCHANT_ACTION];
        $data = ['eventData' => $eventData];

        try {
            $this->httpClient->post('/switch/executor', $data, $params);
        } catch (Exception $e) {
            $this->logger->error('The merchant update could not be processed', ['error' => $e]);
        }
    }
}
