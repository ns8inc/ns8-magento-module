<?php
namespace NS8\Protect\Helper;

use Magento\Customer\Model\Session;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\HTTP\Header;
use Magento\Framework\HTTP\PhpEnvironment\Request;
use Magento\Framework\HTTP\ZendClientFactory;
use Magento\Integration\Api\IntegrationServiceInterface;
use Magento\Integration\Api\OauthServiceInterface;
use NS8\Protect\Helper\Config;
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
     * The integration service interface.
     *
     * @var IntegrationServiceInterface
     */
    protected $integrationServiceInterface;

    /**
     * The OAuth service interface.
     *
     * @var OauthServiceInterface
     */
    protected $oauthServiceInterface;

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
     * Default constructor
     *
     * @param Config $config The config
     * @param Header $header The HTTP header
     * @param IntegrationServiceInterface $integrationServiceInterface The IS interface
     * @param LoggerInterface $logger The logger
     * @param OauthServiceInterface $oauthServiceInterface The OAuth service interface
     * @param Request $request The HTTP request
     * @param Session $session The customer session
     */
    public function __construct(
        Config $config,
        Header $header,
        IntegrationServiceInterface $integrationServiceInterface,
        LoggerInterface $logger,
        OauthServiceInterface $oauthServiceInterface,
        Request $request,
        Session $session
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->header = $header;
        $this->integrationServiceInterface = $integrationServiceInterface;
        $this->logger = $logger;
        $this->oauthServiceInterface = $oauthServiceInterface;
        $this->request = $request;
    }

    /**
     * Makes an HTTP GET request
     *
     * @param string $url URL to target.
     * @param mixed $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    public function get($url, $data = [], $parameters = [], $headers = [], $timeout = 30, $decodeJson = true)
    {
        return $this->executeWithAuth($url, $data, "GET", $parameters, $headers, $timeout, $decodeJson);
    }

    /**
     * Makes an HTTP POST request
     *
     * @param string $url URL to target.
     * @param mixed $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    public function post($url, $data = [], $parameters = [], $headers = [], $timeout = 30, $decodeJson = true)
    {
        $data['session'] = $this->getSessionData();
        $data['username'] = $this->config->getAuthenticatedUserName();
        return $this->executeWithAuth($url, $data, "POST", $parameters, $headers, $timeout);
    }

    /**
     * Internal method to handle the logic of making the HTTP request
     *
     * @param [type] $url
     * @param [type] $data
     * @param string $method
     * @param array $parameters
     * @param array $headers
     * @param integer $timeout
     * @param bool $decodeJson Whether the response JSON should be decoded (defaults to True)
     * @return mixed the XHR reponse object.
     */
    private function executeWithAuth($url, $data, $method = "POST", $parameters = [], $headers = [], $timeout = 30, $decodeJson = true)
    {
        $accessToken = $this->getAccessToken();

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
    private function execute($route, $data = [], $method = "POST", $parameters = [], $headers = [], $timeout = 30, $decodeJson = true)
    {
        try {
            $uri = $this->config->getNS8MiddlewareUrl($route);

            $httpClient = new Client();
            $httpClient->setUri($uri);

            $httpClient->setOptions(['timeout' => $timeout]);
            $httpClient->setMethod($method);
            $httpClient->setParameterGet($parameters);
            $httpClient->setMethod($method);

            $headers['magento-version'] = $this->config->getMagentoVersion();
            $headers['extension-version'] = $this->config->getExtensionVersion();

            if (!empty($headers)) {
                $httpClient->setHeaders($headers);
            }

            if (!empty($data)) {
                $httpClient->setParameterPost($data);
                // #TODO: do we still need this?
                // $json = json_encode($data);
                // $httpClient->setRawBody($json);
            }
            #TODO: decompose this into more discrete steps.
            $body = $httpClient->send()->getBody();

            $response = $decodeJson ? Decoder::decode($body) : $body;
            return $response;
        } catch (\Exception $e) {
            $this->logger->error('Failed to execute API call', ['error'=>$e]);
        }
        #TODO: consumers probably want more control over the response
    }

    /**
     * Auth string has a format of oauth_token=ABC&oauth_token_secret=XYZ. This method
     * extracts the oauth_token string.
     *
     * @param string $authString
     *
     * @return string Oauth access token.
     */
    private function extractOauthTokenFromAuthString($accessTokenString)
    {
        parse_str($accessTokenString, $parsedToken);
        return $parsedToken['oauth_token'];
    }

    private function getAccessToken()
    {
        $storedToken = $this->config->getAccessToken();
        if (!empty($storedToken)) {
            return $storedToken;
        } else {
            $integration = $this->integrationServiceInterface->findByName(Config::NS8_INTEGRATION_NAME);
            $consumerId = $integration->getConsumerId();
            $consumer = $this->oauthServiceInterface->loadConsumer($consumerId);
            $accessTokenString = $this->oauthServiceInterface->getAccessToken($consumerId);
            $accessToken = $this->extractOauthTokenFromAuthString($accessTokenString);

            $protectAccessToken = $this->getProtectAccessToken($consumer->getKey(), $accessToken);
            if (isset($protectAccessToken)) {
                $this->config->setAccessToken($protectAccessToken);
                $storedToken = $protectAccessToken;
            }
        }

        return $storedToken;
    }

    /**
     * Call protect endpoint to exchange Magento creds for a protect access token.
     *
     * @param string $consumerId
     * @param string $accessToken
     *
     * @return string Protect access token.
     */
    private function getProtectAccessToken($consumerId, $accessToken)
    {
        $getParams = [
            'oauth_consumer_key' => $consumerId,
            'access_token' => $accessToken
        ];
        $response = $this->execute('init/magento/access-token', '', 'GET', $getParams);
        if (null == $response) {
            return null;
        }
        if ($response->statusCode >= 400) {
            return null;
        }
        return $response->token;
    }

    /**
     * Get the session data.
     *
     * @return array The session data
     */
    private function getSessionData()
    {
        return [
            'acceptLanguage' => $this->header->getHttpAcceptLanguage(),
            'id' => $this->customerSession->getSessionId(),
            'ip' => $this->request->getClientIp(),
            'userAgent' => $this->header->getHttpUserAgent(),
        ];
    }
}
