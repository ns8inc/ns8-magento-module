<?php

/**
 * The Verify Order class.
 *
 * This handles the verification of orders (via email links).
 */
declare(strict_types=1);

namespace NS8\Protect\Block\Frontend;

use Magento\Framework\App\Request\Http;
use Magento\Framework\Data\Form\FormKey;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Templates\Client as TemplatesClient;
use SimpleXMLElement;
use Zend\Uri\Http as Uri;

/**
 * The Verify Order class.
 *
 * This handles the verification of orders (via email links).
 */
class VerifyOrder extends Template
{
    /**
     * The Config helper.
     *
     * @var Config
     */
    protected $config;

    /**
     * The Magento form key helper.
     *
     * @var FormKey
     */
    protected $formKey;

    /**
     * The Templates client.
     *
     * @var TemplatesClient
     */
    protected $templatesClient;

    /**
     * The HTTP request.
     *
     * @var Http
     */
    private $request;

    /**
     * The constructor.
     *
     * @param Context $context The Magento context
     * @param Http $request The HTTP request
     * @param Config Config helper to init/set config values
     * @param FormKey Magento's form key helper for generating CSRF tokens
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(
        Context $context,
        Http $request,
        Config $config,
        FormKey $formKey,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->request = $request;
        $this->config = $config;
        $this->formKey = $formKey;
        $this->config->initSdkConfiguration();
        $this->templatesClient = new TemplatesClient();
    }

    /**
     * Makes a call to the NS8 Template Service to grab the requested template.
     *
     * There's a lot of hardcoded Shopify-specific stuff in the templates that the service spits out, so we need to
     * hack them up a bit to get them to work in Magento. We really need to fix it up in the Template Service.
     *
     * @return string The template (HTML)
     */
    public function getNS8TemplateHtml(): string
    {
        $params = $this->request->getParams();
        $postParams = $this->request->isPost() ? (array)$this->request->getPost() : null;

        $returnUri = implode('/', [
            $this->getBaseUrl(),
            'ns8protect',
            'order',
            'verify',
            'orderId', ':orderId',
            'token', ':token',
            'verificationId', ':verificationId',
            'view', ':view',
        ]);

        $template = $this->templatesClient->get(
            $params['view'],
            $params['orderId'],
            $params['token'],
            $params['verificationId'],
            $returnUri,
            $postParams
        );

        return isset($template->location)
            ? $this->redirect($template->location)
            : $this->fixForm($template->html);
    }

    /**
     * Fix the form that we receive from the template service so it can be used within Magento.
     *
     * @param string $html The form HTML
     *
     * @return string The fixed HTML
     */
    private function fixForm(string $html): string
    {
        if (preg_match_all('/<form (.*?)>(.*?)<\/form>/is', $html, $matches)) {
            foreach ($matches[1] as $match) {
                // Convert the <form> to a void element so SimpleXML can parse its attributes.
                $xml = new SimpleXMLElement(sprintf('<form %s/>', $match));
                $xml->addAttribute('target', '_parent');
                $dom = dom_import_simplexml($xml);
                $fixedForm = $dom->ownerDocument->saveXML($dom->ownerDocument->documentElement);

                if (preg_match('/<form (.*?)\/>/is', $fixedForm, $innerMatches)) {
                    $html = str_replace($match, $innerMatches[1], $html);
                }
            }

            $hiddenInput = sprintf('<input type="hidden" name="form_key" value="%s"/>', $this->formKey->getFormKey());

            foreach ($matches[2] as $match) {
                $html = str_replace($match, $match . $hiddenInput, $html);
            }
        }

        if (preg_match_all('/<a (.*?)>/is', $html, $matches)) {
            foreach ($matches[1] as $match) {
                // Convert the <a> to a void element so SimpleXML can parse its attributes.
                $xml = new SimpleXMLElement(sprintf('<a %s/>', $match));
                $xml->addAttribute('target', '_parent');
                $dom = dom_import_simplexml($xml);
                $fixedLink = $dom->ownerDocument->saveXML($dom->ownerDocument->documentElement);

                if (preg_match('/<a (.*?)\/>/is', $fixedLink, $innerMatches)) {
                    $html = str_replace($match, $innerMatches[1], $html);
                }
            }
        }

        return $html;
    }

    /**
     * Generate some JS that will make the user's browser redirect to a new URL.
     *
     * @param string $url The URL that the user should get redirected to
     *
     * @return string The JS code (including <script> tags).
     */
    private function redirect(string $url): string
    {
        return sprintf('<script>window.location.replace("%s");</script>', $this->escapeHtml($url));
    }
}
