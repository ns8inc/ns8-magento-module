<?php

namespace NS8\Protect\Helper;

use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\HTTP\Header;
use Magento\Framework\HTTP\PhpEnvironment\Request;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\Session\SessionManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Helper Utility for Session Data
 */
class Session extends AbstractHelper
{
    /**
     * The customer session.
     *
     * @var CustomerSession
     */
    protected $customerSession;

    /**
     * The HTTP header.
     *
     * @var Header
     */
    protected $header;

    /**
     * @var LoggerInterface
     */
    protected $logger;

     /**
      * The HTTP request.
      *
      * @var Request
      */
    protected $request;

    /**
     * @var SessionManagerInterface
     */
    protected $session;

    /**
     * Default constructor
     *
     * @param LoggerInterface $loggerInterface
     * @param SessionManagerInterface $session
     * @param Request $request The HTTP request
     * @param CustomerSession $customerSession The customer session
     * @param Header $header The HTTP header
     */
    public function __construct(
        LoggerInterface $loggerInterface,
        SessionManagerInterface $session,
        Request $request,
        CustomerSession $customerSession,
        Header $header
    ) {
        $this->logger = $loggerInterface;
        $this->session = $session;
        $this->request = $request;
        $this->customerSession = $customerSession;
        $this->header = $header;
    }

    /**
     * Set Session Data values based on POST request body
     *
     * @param array $postBody
     *
     * @return array
     */
    public function saveSessionDataFromPostBody(array $postBody)
    {
        // Retrieve desired session data values from POST body
        $screenHeight = $postBody['screenHeight'];
        $screenWidth = $postBody['screenWidth'];

        // Set Session data values
        $result = [];
        if (isset($screenHeight)) {
            $this->session->setScreenHeight($screenHeight);
            $result['screenHeight'] = $screenHeight;
        }
        if (isset($screenWidth)) {
            $this->session->setScreenWidth($screenWidth);
            $result['screenWidth'] = $screenWidth;
        }

        return $result;
    }

    /**
     * Get the session data.
     *
     * @return array The session data passed in
     */
    public function getSessionData(): array
    {
        return [
            'acceptLanguage' => $this->header->getHttpAcceptLanguage(),
            'id' => $this->customerSession->getSessionId(),
            'ip' => $this->request->getClientIp(),
            'screenHeight' => $this->session->getScreenHeight(),
            'screenWidth' => $this->session->getScreenWidth(),
            'userAgent' => $this->header->getHttpUserAgent(),
        ];
    }
}
