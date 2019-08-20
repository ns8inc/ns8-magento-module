<?php
namespace NS8\CSP2\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Logger\Monolog as Logger;
use Magento\Customer\Model\Session;

class OrderUpdate implements ObserverInterface
{
    protected $_request;
    protected $_customerSession;
    protected $_logger;
    /**
     * Observer construct method
     *
     * @param Http $request
     * @param Session $session
     * @param Logger $logger
     */
    public function __construct(Http $request, Session $session, Logger $logger)
    {
        $this->_customerSession = $session;
        $this->_logger = $logger;
        $this->_request = $request;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        #TODO: make this configurable
        $uri = 'http://cfro-magento.ngrok.io/';
        $httpClient = new \Zend\Http\Client();
        $httpClient->setUri($uri);
        $httpClient->setOptions(array('timeout' => 30));

        try {
            $order = $observer->getEvent()->getOrder();
        } catch (\Exception $e) {
        }

        try {
            #TODO: send the $order
            $response = \Zend\Json\Decoder::decode($httpClient->send()->getBody());
            $this->_customerSession->setLocationData($response);
            $this->_customerSession->setLocated(true);
        } catch (\Exception $e) {
            $this->_logger->critical($e);
        }
    }
}