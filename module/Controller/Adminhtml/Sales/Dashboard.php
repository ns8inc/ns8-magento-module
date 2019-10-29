<?php

namespace NS8\Protect\Controller\Adminhtml\Sales;

use \Magento\Backend\App\Action;
use \Magento\Backend\App\Action\Context;
use \Magento\Framework\View\Result\PageFactory;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Logger;
use NS8\Protect\Helper\Config;

class Dashboard extends Action
{
    /**
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * Constructor
     *
     * @param Context $context
     * @param PageFactory $resultPageFactory
     */
    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        HttpClient $httpClient,
        Logger $logger,
        Config $config
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->resultPageFactory = $resultPageFactory;
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        $this->config = $config;
    }

    /**
     * {@inheritdoc}
     */
    protected function _isAllowed()
    {
        return $this->context->getAuthorization()->isAllowed('NS8_Protect::admin');
    }

    /**
     * Load the page defined in view/adminhtml/layout/ns8protectadmin_sales_dashboard.xml
     *
     * @return \Magento\Framework\View\Result\Page
     */
    public function execute()
    {
        $merchant = $this->httpClient->get('/merchant/current', '');
        if (empty($merchant->error)) {
            $this->logger->debug('MERCHANT ==> ' . $merchant->name);
        } else {
            $this->logger->error($merchant->statusCode . ' ' . $merchant->error);
        }
        return $this->resultPageFactory->create();
    }
}
