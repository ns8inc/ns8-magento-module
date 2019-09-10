<?php
namespace NS8\CSP2\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\HTTP\ZendClientFactory;
use Psr\Log\LoggerInterface;
use Zend\Http\Client;
use Zend\Json\Decoder;
use Magento\Integration\Api\IntegrationServiceInterface;
use Magento\Integration\Api\OauthServiceInterface;

use NS8\CSP2\Helper\Config;

/**
 * General purpose HTTP/REST client for making API calls
 */
class HttpClient extends AbstractHelper
{
    protected $config;
    protected $logger;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param LoggerInterface $logger
     */
    public function __construct(
        Config $config,
        LoggerInterface $logger,
        OauthServiceInterface $oauthServiceInterface,
        IntegrationServiceInterface $integrationServiceInterface
    ) {
        $this->config = $config;
        $this->logger = $logger;
        $this->integrationServiceInterface = $integrationServiceInterface;
        $this->oauthServiceInterface = $oauthServiceInterface;
    }

    /**
     * Makes an HTTP GET request
     *
     * @param string $url URL to target.
     * @param mixed $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @return mixed the XHR reponse object.
     */
    public function get($url, $data = [], $parameters = [], $headers = [], $timeout = 30)
    {
        return $this->executeWithAuth($url, $data, "GET", $parameters, $headers, $timeout);
    }

    /**
     * Makes an HTTP POST request
     *
     * @param string $url URL to target.
     * @param mixed $data Data to include in the request body.
     * @param array $parameters Optional array of request parameters.
     * @param array $headers Optional array of request headers.
     * @param integer $timeout Optional timeout value. Default 30.
     * @return mixed the XHR reponse object.
     */
    public function post($url, $data = [], $parameters = [], $headers = [], $timeout = 30)
    {
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
     * @return mixed the XHR reponse object.
     */
    private function executeWithAuth($url, $data, $method = "POST", $parameters = [], $headers = [], $timeout = 30)
    {
        $accessToken = $this->getAccessToken();

        $authHeaderString = 'Bearer ' . $accessToken;

        $authHeader = array('Authorization' => $authHeaderString);
        $allHeaders = array_merge($headers, $authHeader);
        return $this->execute($url, $data, $method, $parameters, $allHeaders, $timeout);
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
     * @return mixed the XHR reponse object.
     */
    private function execute($route, $data = [], $method = "POST", $parameters = [], $headers = [], $timeout = 30)
    {
        try {
            $uri = $this->config->getApiBaseUrl().$route;
            $httpClient = new Client();
            $httpClient->setUri($uri);

            $httpClient->setOptions(array('timeout' => $timeout));
            $httpClient->setMethod($method);
            $httpClient->setParameterGet($parameters);

            $httpClient->setMethod($method);
            if (!empty($headers)) {
                $httpClient->setHeaders($headers);
            }
            #TODO: make this more robust; nothing everything can be converted to JSON
            $json = json_encode($data);
            #TODO: this is a KLUDGE. There must be a better way!
            $httpClient->setRawBody($json);
            #TODO: decompose this into more discrete steps.
            $body = $httpClient->send()->getBody();

            $response = Decoder::decode($body);
            return $response;
        } catch (\Exception $e) {
            $this->logger->error('Failed to execute API call', array('error'=>$e));
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
            $integration = $this->integrationServiceInterface->findByName('NS8 Integration');
            $consumerId = $integration->getConsumerId();
            $consumer = $this->oauthServiceInterface->loadConsumer($consumerId);
            $accessTokenString = $this->oauthServiceInterface->getAccessToken($consumerId);
            $accessToken = $this->extractOauthTokenFromAuthString($accessTokenString);

            $protectAccessToken = $this->getProtectAccessToken($consumer->getKey(), $accessToken);
            $this->config->setAccessToken($protectAccessToken);
            $storedToken = $protectAccessToken;
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
        $getParams = array(
            'oauth_consumer_key' => $consumerId,
            'access_token' => $accessToken
        );
        $response = $this->execute('/protect/magento/accessTokens', '', 'GET', $getParams);
        return $response->token;
    }
}
