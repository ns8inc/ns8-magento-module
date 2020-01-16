<?php

namespace NS8\Protect\Controller\Sessiondata;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use NS8\Protect\Helper\Session as SessionHelper;

/**
 * The Session Data POST action
 */
class Index extends Action
{
    /**
     * The JSON result factory.
     *
     * @var JsonFactory
     */
    protected $jsonResultFactory;

    /**
     * The session helper.
     *
     * @var SessionHelper
     */
    protected $sessionHelper;

    /**
     * Constructor
     *
     * @param Context $context
     * @param JsonFactory $jsonResultFactory
     * @param SessionHelper $sessionHelper
     */
    public function __construct(
        Context $context,
        JsonFactory $jsonResultFactory,
        SessionHelper $sessionHelper
    ) {
        parent::__construct($context);
        $this->context = $context;
        $this->jsonResultFactory = $jsonResultFactory;
        $this->sessionHelper = $sessionHelper;
    }

    /**
     * Set Session Data values based on POST request
     *
     * @return JsonFactory
     */
    public function execute()
    {
        // Retrieve desired session data values from POST body
        $postBody = $this->getRequest()->getPost()->getArrayCopy();

        $result = [];
        $savedSessionData = $this->sessionHelper->saveSessionDataFromPostBody($postBody);
        $result['data'] = $savedSessionData;
        if (count($savedSessionData) > 0) {
            $result['status'] = 'ok';
        } else {
            $result['status'] = 'no change';
        }

        // Create and return desired JSON response
        $response = $this->jsonResultFactory->create();
        $response->setData($result);
        return $response;
    }
}
