<?php

/**
 * The Verify Order class.
 *
 * This handles the verification of orders (via email links).
 */
declare(strict_types=1);

namespace NS8\Protect\Block\Frontend;

use Magento\Framework\App\Request\Http;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use NS8\Protect\Helper\HttpClient;
use RuntimeException;
use Zend\Uri\Http as Uri;

/**
 * The Verify Order class.
 *
 * This handles the verification of orders (via email links).
 */
class VerifyOrder extends Template
{
    /**
     * The HTTP client helper.
     *
     * @var HttpClient
     */
    private $httpClient;

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
     * @param HttpClient $httpClient The HTTP client
     * @param Http $request The HTTP request
     * @param array $data The data to pass to the Template constructor (optional)
     */
    public function __construct(
        Context $context,
        HttpClient $httpClient,
        Http $request,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->httpClient = $httpClient;
        $this->request = $request;
    }

    /**
     * Makes a call to the NS8 Template Service to grab the requested template.
     *
     * There's a lot of hardcoded Shopify-specific stuff in the templates that the service spits out, so we need to
     * hack them up a bit to get them to work in Magento. We really need to fix it up in the Template Service.
     *
     * @throws RuntimeException If a valid view was not specified in the URL.
     *
     * @return string The template (HTML)
     */
    public function getNS8TemplateHtml(): string
    {
        $params = $this->request->getParams();

        $validViews = [
            'orders-reject',
            'orders-reject-confirm',
            'orders-validate',
            'orders-validate-code',
        ];

        if (!in_array($params['view'] ?? null, $validViews)) {
            throw new RuntimeException('No valid view was specified in the URL.');
        }

        if ($this->request->isPost()) {
            $postFields = array_merge($params, (array)$this->request->getPost(), [
                'returnUri' => implode('/', [
                    $this->getBaseUrl(),
                    'ns8protect',
                    'order',
                    'verify',
                    'orderId', '{orderId}',
                    'verificationId', '{verificationId}',
                    'view', '{view}',
                ]),
            ]);

            $response = $this->httpClient->post('merchant/template', $postFields);
        } else {
            $response = $this->httpClient->get(sprintf('merchant/template?%s', http_build_query($params)));
        }

        return isset($response->location)
            ? $this->redirect($response->location)
            : $this->unShopifyNS8Template($response->html);
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

    /**
     * This is a crappy, hopefully temporary method to remove all Shopify-specific stuff from the NS8 template
     * and replace it with something more palatable to Magento.
     *
     * @param string $template The NS8 template
     *
     * @return string The converted template
     */
    private function unShopifyNS8Template(string $template): string
    {
        // If we find an HTML body tag, we're only interested in the stuff inside it (not the html/head/etc. tags).
        if (preg_match('/<body>(.*)(<\/body>)/s', $template, $matches)) {
            $template = $matches[1];
        }

        $template = preg_replace_callback(
            '#"(/apps/ns8-protect.*?)"#',
            function (array $matches): string {
                $uri = new Uri($matches[1]);
                $query = str_replace(['=', '&'], '/', $uri->getQuery());

                return sprintf('%s/ns8protect/order/verify/%s', $this->getBaseUrl(), $query);
            },
            $template
        );

        return $template;
    }
}
