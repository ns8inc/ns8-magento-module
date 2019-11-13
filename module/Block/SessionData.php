<?php

/**
 * The SessionData class.
 *
 * This handles the loading of the TrueStats tracking script.
 */

declare(strict_types=1);

namespace NS8\Protect\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Framework\Session\SessionManagerInterface;
use NS8\Protect\Helper\Url;

/**
 * The SessionData class.
 *
 * This handles the loading of the TrueStats tracking script.
 */
class SessionData extends Template
{
    /**
     * The Session
     *
     * @var SessionManagerInterface
     */
    public $session;

    /**
     * The URL Helper
     *
     * @var Url
     */
    public $url;

    /**
     * The constructor.
     *
     * @param Context $context The Magento context
     * @param SessionManagerInterface $session The Session
     * @param Url url The URL Helper
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(
        Context $context,
        SessionManagerInterface $session,
        Url $url,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->session = $session;
        $this->url = $url;
    }

    /**
     * Determine if we have the session data we want
     *
     * @return boolean
     */
    public function hasSessionData(): bool
    {
        if ($this->session->getScreenHeight() === null) {
            return false;
        }

        if ($this->session->getScreenWidth() === null) {
            return false;
        }

        return true;
    }
}
