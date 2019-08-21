<?php
namespace NS8\CSP2\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Logger\Monolog as Logger;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\App\ObjectManager;
use Magento\Sales\Api\Data\OrderInterface as OrderInterface;

class OrderUpdate implements ObserverInterface
{
    protected $_request;
    protected $_customerSession;
    protected $_logger;
    protected $_order;
    /**
     * Observer construct method
     *
     * @param Http $request
     * @param Session $session
     * @param Logger $logger
     */
    public function __construct(Http $request, Session $session, Logger $logger, OrderInterface $order)
    {
        $this->_customerSession = $session;
        $this->_logger = $logger;
        $this->_request = $request;
        $this->_order = $order;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        try {
            $uri = getenv('NS8_PROTECT_URL', true) ?: getenv('NS8_PROTECT_URL') ?: 'https://protect.ns8.com/';
            $httpClient = new \Zend\Http\Client();
            $httpClient->setUri($uri);
            $httpClient->setOptions(array('timeout' => 30));
            $order = $observer->getEvent()->getOrder()->getData();
            $httpClient->setMethod(\Zend_Http_Client::POST);
            $orderJson = json_encode($order);
            $httpClient->setRawBody($orderJson);
            $response = \Zend\Json\Decoder::decode($httpClient->send()->getBody());
            $this->_customerSession->setLocationData($response);
            $this->_customerSession->setLocated(true);
        } catch (\Exception $e) {
            $this->_logger->critical($e);
        }
    }
}