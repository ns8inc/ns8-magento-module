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
use NS8\Protect\Helper\Url;
use NS8\ProtectSDK\Http\Client as HttpClient;

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */
class Script extends Template
{
    /**
     * The URL Helper class
     *
     * @var Url
     */
    public $url;

    /**
     * The constructor.
     *
     * @param Context $context The Magento context
     * @param Url $url The URL Helper attribute
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(Context $context, Url $url, array $data = [])
    {
        parent::__construct($context, $data);
        $this->url = $url;
    }

    /**
     * Get the TrueStats tracking script (wrapped in HTML <script> tags).
     *
     * @return string The tracking script
     */
    public function getScriptHtml(): string
    {
        $coreScript =
        $script = (new HttpClient())->getNonJson('/init/script');

        return is_string($script) ? sprintf('<script>%s</script>', $script) : '';
    }
}
