<?php

namespace NS8\Protect\Controller\SessionData;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Session\SessionManagerInterface;
use NS8\Protect\Helper\Logger;

/**
 * The NS8 Protect Dashboard page
 */
class Index extends Action
{
    /**
     * @var JsonFactory
     */
    protected $jsonResultFactory;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * @var SessionManagerInterface
     */
    protected $session;

    /**
     * Constructor
     *
     * @param Context $context
     * @param JsonFactory $jsonResultFactory
     * @param Logger $logger
     * @param SessionManagerInterface $session
     */
    public function __construct(
        Context $context,
        Logger $logger,
        JsonFactory $jsonResultFactory,
        SessionManagerInterface $session
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->jsonResultFactory = $jsonResultFactory;
        $this->logger = $logger;
        $this->session = $session;
    }

    /**
     * Load the page defined in view/frontend/layout/sessiondata.xml
     *
     * @return JsonFactory
     */
    public function execute()
    {
        $request = $this->getRequest();
        $result = $this->jsonResultFactory->create();

        $screenHeight = $request->getPost('screenHeight');
        $screenWidth = $request->getPost('screenWidth');

        $this->session->setScreenHeight($screenHeight);
        $this->session->setScreenWidth($screenWidth);

        $result->setData($this->session->getData());
        return $result;
    }
}
