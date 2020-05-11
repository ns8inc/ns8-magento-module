<?php

namespace NS8\Protect\Helper;

use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\HTTP\Header;
use Magento\Framework\HTTP\PhpEnvironment\Request;
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
     * The logger interface.
     *
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
     * The session.
     *
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
        // Set Session data values
        $result = [];
        if (isset($postBody['screenHeight'])) {
            $this->session->setScreenHeight($postBody['screenHeight']);
            $result['screenHeight'] = $postBody['screenHeight'];
        }
        if (isset($postBody['screenWidth'])) {
            $this->session->setScreenWidth($postBody['screenWidth']);
            $result['screenWidth'] = $postBody['screenWidth'];
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
