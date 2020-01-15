<?php

namespace NS8\Protect\Observer;

use Throwable;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Actions\Client as ActionsClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

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
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * @var Http
     */
    protected $request;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param Http $request
     * @param Session $session
     */
    public function __construct(
        Config $config,
        Http $request,
        Session $session
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->request = $request;
        $this->loggingClient = new LoggingClient();
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
            $this->loggingClient->error('The event data could not be retrieved', $e);
            return;
        }

        $data = ['eventData' => $eventData];

        try {
            $this->config->initSdkConfiguration();

            // Send Action Update
            ActionsClient::setAction(ActionsClient::UPDATE_MERCHANT_ACTION, $data);
        } catch (Throwable $e) {
            $this->loggingClient->error('The merchant update could not be processed', $e);
        }
    }
}
