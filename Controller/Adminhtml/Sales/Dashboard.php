<?php

namespace NS8\Protect\Controller\Adminhtml\Sales;

use Throwable;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Logging\Client as LoggingClient;
use NS8\ProtectSDK\Merchants\Client as MerchantsClient;

/**
 * The NS8 Protect Dashboard page
 */
class Dashboard extends Action
{
    /**
     * The logging client.
     *
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * The Merchants client.
     *
     * @var MerchantsClient
     */
    protected $merchantsClient;

    /**
     * The result page factory.
     *
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * Constructor
     *
     * @param Context $context The context
     * @param PageFactory $resultPageFactory The result page factory
     * @param Config $config The config
     */
    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        Config $config
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->resultPageFactory = $resultPageFactory;
        $this->config = $config;

        // Init SDK Configuration before invoking HTTP Client:wq
        
        $this->config->initSdkConfiguration();
        $this->loggingClient = new LoggingClient();
        $this->merchantsClient = new MerchantsClient();
    }

    /**
     * {@inheritdoc}
     */
    // @codingStandardsIgnoreStart (This is an inherited method)
    protected function _isAllowed()
    {
        return $this->config->isAllowed($this->context);
    }
    // @codingStandardsIgnoreEnd

    /**
     * Load the page defined in view/adminhtml/layout/ns8protectadmin_sales_dashboard.xml
     *
     * @return Page
     */
    public function execute()
    {
        $resultPage = $this->resultPageFactory->create();
        try {
            $merchant = $this->merchantsClient->getCurrent();

            if (empty($merchant)) {
                $this->loggingClient->error('Request to Protect failed to get the current merchant');
                return $resultPage;
            }

            if (empty($merchant->error)) {
                $this->loggingClient->debug('MERCHANT ==> ' . $merchant->name);
            } else {
                $this->loggingClient->error($merchant->statusCode . ' ' . $merchant->error);
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('The Protect API is not available', $e);
        }

        return $resultPage;
    }
}
