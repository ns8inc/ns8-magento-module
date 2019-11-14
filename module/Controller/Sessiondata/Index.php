<?php

namespace NS8\Protect\Controller\SessionData;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Session\SessionManagerInterface;
use NS8\Protect\Helper\Logger;

/**
 * The Session Data POST action
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
     * Set Session Data values based on POST request
     *
     * @return JsonFactory
     */
    public function execute()
    {
        // Retrieve desired session data values from POST body
        $request = $this->getRequest();
        $screenHeight = $request->getPost('screenHeight');
        $screenWidth = $request->getPost('screenWidth');

        // Set Session data values
        if (isset($screenHeight)) {
            $this->session->setScreenHeight($screenHeight);
        }
        if (isset($screenWidth)) {
            $this->session->setScreenWidth($screenWidth);
        }

        // Create and return desired JSON response
        $result = $this->jsonResultFactory->create();
        $result->setData($this->session->getData());
        return $result;
    }
}
