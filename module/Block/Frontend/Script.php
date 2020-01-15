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
use NS8\ProtectSDK\Http\Client as HttpClient;

/**
 * The Script class.
 *
 * This handles the loading of the TrueStats tracking script.
 */
class Script extends Template
{
    /**
     * Get the TrueStats tracking script (wrapped in HTML <script> tags).
     *
     * @return string The tracking script
     */
    public function getScriptHtml(): string
    {
        $script = (new HttpClient())->getNonJson('/init/script');

        return is_string($script) ? sprintf('<script>%s</script>', $script) : '';
    }
}
