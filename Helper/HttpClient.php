<?php

namespace NS8\Protect\Helper;

use Exception;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\HTTP\Header;
use Magento\Framework\HTTP\PhpEnvironment\Request;
use Magento\Framework\Session\SessionManagerInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Url;
use Psr\Log\LoggerInterface;
use Zend\Http\Client;
use Zend\Json\Decoder;

/**
 * General purpose HTTP/REST client for making API calls
 */
class HttpClient extends AbstractHelper
{
    /**
     * The configuration.
     *
     * @var Config
     */
    protected $config;

    /**
     * The customer session.
     *
     * @var Session
     */
    protected $customerSession;

    /**
     * The HTTP header.
     *
     * @var Header
     */
    protected $header;

    /**
     * The logger.
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
     * URL Helper
     *
     * @var Url
     */
    protected $url;

    /**
     * The Core session.
     *
     * @var SessionManagerInterface
     */
    protected $session;

    /**
     * Default constructor
     *
     * @param Config $config The config
     * @param Header $header The HTTP header
     * @param LoggerInterface $logger The logger
     * @param Request $request The HTTP request
     * @param Session $customerSession The customer session
     * @param SessionManagerInterface $session The Core session
     * @param Url $url URL helper
     */
    public function __construct(
        Config $config,
        Header $header,
        LoggerInterface $logger,
        Request $request,
        Session $customerSession,
        SessionManagerInterface $session,
        Url $url
    ) {
        $this->config = $config;
        $this->customerSession = $customerSession;
        $this->session = $session;
        $this->header = $header;
        $this->logger = $logger;
        $this->request = $request;
        $this->url = $url;
    }

    /**
     * Makes an HTTP GET request
     *
     * @param string $url URL to target.
     * @param array $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    public function get(
        string $url,
        array $data = [],
        array $parameters = [],
        array $headers = [],
        int $timeout = 30,
        bool $decodeJson = true
    ) {
        return $this->executeWithAuth($url, $data, "GET", $parameters, $headers, $timeout, $decodeJson);
    }

    /**
     * Makes an HTTP POST request
     *
     * @param string $url URL to target.
     * @param array $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    public function post(
        string $url,
        array $data = [],
        array $parameters = [],
        array $headers = [],
        int $timeout = 30,
        bool $decodeJson = true
    ) {
        $data['session'] = $this->getSessionData();
        $data['username'] = $this->config->getAuthenticatedUserName();
        return $this->executeWithAuth($url, $data, "POST", $parameters, $headers, $timeout);
    }

    /**
     * Makes an HTTP PUT request
     *
     * @param string $url URL to target.
     * @param array $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    public function put(
        string $url,
        array $data = [],
        array $parameters = [],
        array $headers = [],
        int $timeout = 30,
        bool $decodeJson = true
    ) {
        return $this->executeWithAuth($url, $data, "PUT", $parameters, $headers, $timeout);
    }

    /**
     * Internal method to handle the logic of making the HTTP request
     *
     * @param string $url
     * @param array $data
     * @param string $method
     * @param array $parameters
     * @param array $headers
     * @param integer $timeout
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    private function executeWithAuth(
        string $url,
        array $data,
        string $method = "POST",
        array $parameters = [],
        array $headers = [],
        int $timeout = 30,
        bool $decodeJson = true
    ) {
        $accessToken = $this->config->getAccessToken();

        $authHeaderString = 'Bearer ' . $accessToken;

        $authHeader = ['Authorization' => $authHeaderString];
        $allHeaders = array_merge($headers, $authHeader);
        return $this->execute($url, $data, $method, $parameters, $allHeaders, $timeout, $decodeJson);
    }

    /**
     * Internal method to handle the logic of making the HTTP request
     *
     * @param string $route
     * @param array $data
     * @param string $method
     * @param array $parameters
     * @param array $headers
     * @param integer $timeout
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    private function execute(
        string $route,
        array $data = [],
        string $method = "POST",
        array $parameters = [],
        array $headers = [],
        int $timeout = 30,
        bool $decodeJson = true
    ) {
        $response = null;
        try {
            $uri = $this->config->getNS8MiddlewareUrl($route);

            $httpClient = new Client();
            $httpClient->setUri($uri);

            $httpClient->setOptions(['timeout' => $timeout]);
            $httpClient->setMethod($method);
            $httpClient->setParameterGet($parameters);
            $httpClient->setMethod($method);

            $headers['magento-version'] = $this->config->getMagentoVersion();
            $headers['extension-version'] = $this->config->getProtectVersion();

            if (!empty($headers)) {
                $httpClient->setHeaders($headers);
            }

            if (!empty($data)) {
                $httpClient->setParameterPost($data);
            }
            $body = $httpClient->send()->getBody();

            $response = $decodeJson ? Decoder::decode($body) : $body;
        } catch (Exception $e) {
            $this->logger->error('Failed to execute API call', ['error' => $e]);
        }
        return $response;
    }

    /**
     * Get the session data.
     *
     * @return array The session data passed in
     */
    private function getSessionData(): array
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
