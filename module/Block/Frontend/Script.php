<?php

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */
declare(strict_types=1);

namespace NS8\Protect\Block\Frontend;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use NS8\Protect\Helper\HttpClient;

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */
class Script extends Template
{
    /**
     * The HTTP client helper.
     *
     * @var \NS8\Protect\Helper\HttpClient
     */
    private $httpClient;

    /**
     * The constructor.
     *
     * @param \Magento\Framework\View\Element\Template\Context $context The Magento context
     * @param \NS8\Protect\Helper\HttpClient $httpClient The HTTP client
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(Context $context, HttpClient $httpClient, array $data = [])
    {
        parent::__construct($context, $data);
        $this->httpClient = $httpClient;
    }

    /**
     * Get the TrueStats tracking script (JS code).
     *
     * @return string The tracking script
     */
    public function getScript(): string
    {
        return $this->httpClient->get('/init/script', [], [], [], 30, false);
    }
}
