<?php

namespace NS8\Protect\Observer;

use Throwable;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Logger;
use NS8\Protect\Helper\SwitchActionType;
use NS8\ProtectSDK\Config\Manager as ConfigManager;
use NS8\ProtectSDK\Actions\Client as ActionsClient;

/**
 * Responds to merchant update events
 */
class MerchantUpdate implements ObserverInterface
{
    /**
     * @var Config
     */
    protected $config;

    /**
     * @var Session
     */
    protected $customerSession;

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
     * @param Config $config
     * @param Http $request
     * @param Logger $logger
     * @param Session $session
     */
    public function __construct(
        Config $config,
        Http $request,
        Logger $logger,
        Session $session
    ) {
        $this->config = $config;
        $this->customerSession = $session;
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
        } catch (Throwable $e) {
            $this->logger->error('The event data could not be retrieved', ['error' => $e]);
            return;
        }

        $data = ['eventData' => $eventData];

        try {
            $this->config->initSdkConfiguration();
            
            // Send Action Update
            ActionsClient::setAction(ActionsClient::UPDATE_MERCHANT_ACTION, $data);
        } catch (Throwable $e) {
            $this->logger->error('The merchant update could not be processed', ['error' => $e]);
        }
    }
}
