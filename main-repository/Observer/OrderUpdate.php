<?php
namespace NS8\CSP2\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\App\Request\Http;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\App\ObjectManager;
use Magento\Sales\Api\Data\OrderInterface;

use NS8\CSP2\Logger;
use NS8\CSP2\HttpClient;

class OrderUpdate implements ObserverInterface
{
    protected $request;
    protected $customerSession;
    protected $logger;
    protected $order;
    protected $httpClient;
    
    /**
     * Default constructor
     *
     * @param Http $request
     * @param Session $session
     * @param Logger $logger
     * @param OrderInterface $order
     */
    public function __construct(
        Http $request,
        Session $session,
        Logger $logger,
        OrderInterface $order,
        HttpClient $httpClient
    ) {
        $this->customerSession = $session;
        $this->logger = $logger;
        $this->request = $request;
        $this->order = $order;
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
            $order = $observer->getEvent()->getOrder()->getData();
            $response = $httpClient->post($order);
        } catch (\Exception $e) {
            $this->logger->error($e);
        }
    }
}
