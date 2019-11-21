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
     * @var HttpClient
     */
    private $httpClient;

    /**
     * The constructor.
     *
     * @param Context $context The Magento context
     * @param HttpClient $httpClient The HTTP client
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(Context $context, HttpClient $httpClient, array $data = [])
    {
        parent::__construct($context, $data);
        $this->httpClient = $httpClient;
    }

    /**
     * Get the TrueStats tracking script (wrapped in HTML <script> tags).
     *
     * @return string The tracking script
     */
    public function getScriptHtml(): string
    {
        $script = $this->httpClient->post('/init/script', [], [], [], 30, false);

        return is_string($script) ? sprintf('<script>%s</script>', $script) : '';
    }
}
