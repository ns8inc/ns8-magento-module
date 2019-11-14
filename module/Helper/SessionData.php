<?php

namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\Session\SessionManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Helper Utility for Session Data
 */
class SessionData extends AbstractHelper
{
    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @var SessionManagerInterface
     */
    protected $session;

    /**
     * Default constructor
     *
     * @param LoggerInterface $loggerInterface
     * @param SessionManagerInterface $session
     */
    public function __construct(
        LoggerInterface $loggerInterface,
        SessionManagerInterface $session
    ) {
        $this->logger = $loggerInterface;
        $this->session = $session;
    }

    /**
     * Set Session Data values based on POST request
     *
     * @param array $postBody
     *
     * @return array
     */
    public function saveSessionDataFromRequest(array $postBody)
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
}
