<?php
namespace NS8\Protect\Helper;

use Exception;
use Magento\Customer\Model\Session;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\HTTP\Header;
use Magento\Framework\HTTP\PhpEnvironment\Request;
use Magento\Framework\HTTP\ZendClientFactory;
use Magento\Integration\Api\IntegrationServiceInterface;
use Magento\Integration\Api\OauthServiceInterface;
use Magento\Sales\Api\Data\OrderInterface;
use NS8\Protect\Helper\Config;
use Psr\Log\LoggerInterface;
use Zend\Http\Client;
use Zend\Json\Decoder;
use Zend\Uri\Uri;

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
     * Zend URI helper
     *
     * @var Uri
     */
    protected $uri;

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
     * @param Uri $uri Zend URI helper
     */
    public function __construct(
        Config $config,
        Header $header,
        IntegrationServiceInterface $integrationServiceInterface,
        LoggerInterface $logger,
        OauthServiceInterface $oauthServiceInterface,
        Request $request,
        Session $session,
        Uri $uri
    ) {
        $this->config = $config;
        $this->customerSession = $session;
        $this->header = $header;
        $this->integrationServiceInterface = $integrationServiceInterface;
        $this->logger = $logger;
        $this->oauthServiceInterface = $oauthServiceInterface;
        $this->request = $request;
        $this->uri = $uri;
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
    public function get($url, $data = [], $parameters = [], $headers = [], $timeout = 30, $decodeJson = true)
    {
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
    public function post($url, $data = [], $parameters = [], $headers = [], $timeout = 30, $decodeJson = true)
    {
        $data['session'] = $this->getSessionData();
        $data['username'] = $this->config->getAuthenticatedUserName();
        return $this->executeWithAuth($url, $data, "POST", $parameters, $headers, $timeout);
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
        $url,
        $data,
        $method = "POST",
        $parameters = [],
        $headers = [],
        $timeout = 30,
        $decodeJson = true
    ) {
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
    private function execute(
        $route,
        $data = [],
        $method = "POST",
        $parameters = [],
        $headers = [],
        $timeout = 30,
        $decodeJson = true
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
            $this->logger->error('Failed to execute API call', ['error'=>$e]);
        }
        return $response;
    }

    /**
     * Auth string has a format of oauth_token=ABC&oauth_token_secret=XYZ. This method
     * extracts the oauth_token string.
     *
     * @param string $authString
     *
     * @return string|null Oauth access token.
     */
    private function extractOauthTokenFromAuthString($accessTokenString) : ?string
    {
        $this->uri->setQuery($accessTokenString);
        $parsedToken = $this->uri->getQueryAsArray();
        if ($parsedToken) {
            return $parsedToken['oauth_token'];
        } else {
            return null;
        }
    }

    /**
     * Gets a Protect Access Token if the OAuth has succeeded
     *
     * @return string|null
     */
    private function getAccessToken() : ?string
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
     * @return string|null Protect access token.
     */
    private function getProtectAccessToken($consumerId, $accessToken) : ?string
    {
        $getParams = [
            'oauth_consumer_key' => $consumerId,
            'access_token' => $accessToken
        ];
        $response = $this->execute('init/magento/access-token', '', 'GET', $getParams);
        if (null == $response) {
            return null;
        }
        if (isset($response->statusCode) && $response->statusCode >= 400) {
            return null;
        }
        if (isset($response->token)) {
            return $response->token;
        } else {
            return null;
        }
    }

    /**
     * Get the session data.
     *
     * @return array The session data
     */
    private function getSessionData() : array
    {
        return [
            'acceptLanguage' => $this->header->getHttpAcceptLanguage(),
            'id' => $this->customerSession->getSessionId(),
            'ip' => $this->request->getClientIp(),
            'userAgent' => $this->header->getHttpUserAgent(),
        ];
    }

    /**
     * Get an EQ8 Score from an order id. If it does not exist locally, fetch it from the API and store it.
     * @param string|null $orderId
     * @return int|null An EQ8 Score for this order Id
     */
    public function getEQ8Score(string $orderId = null): ?int
    {
        $order = $this->config->getOrder($orderId);
        if (!isset($order)) {
            throw new UnexpectedValueException('Order Id: '.$orderId.' could not be found');
        }
        $eq8Score = $order->getData('eq8_score');
        if (isset($eq8Score)) {
            return $eq8Score;
        }

        $orderIncId = $order->getIncrementId();
        $uri = sprintf('/orders/order-name/%s', $this->config->base64UrlEncode($orderIncId));
        $req = $this->get($uri);

        if (!isset($req->fraudAssessments)) {
            return null;
        }

        // The goal here is to look in the fraudAssessments array and return the first score we find that's an EQ8.
        $eq8Score = array_reduce($req->fraudAssessments, function (?int $foundScore, \stdClass $fraudAssessment): ?int {
            if (!empty($foundScore)) {
                return $foundScore;
            }
            return $fraudAssessment->providerType === 'EQ8' ? $fraudAssessment->score : null;
        });
        if (!isset($eq8Score)) {
            return null;
        }

        $this->setEQ8Score($eq8Score, $order);
        return $eq8Score;
    }

    /**
     * Sets the EQ8 Score on an order
     * @param int $eq8Score The score to persist
     * @param OrderInterface $order The order to update
     * @return int The saved EQ8 Score
     */
    public function setEQ8Score(int $eq8Score, $order) : int
    {
        $order
            ->setData('eq8_score', $eq8Score)
            ->save();

        return $eq8Score;
    }

    /**
     * Get an EQ8 Score from an order id. If it does not exist locally, fetch it from the API and store it.
     * @param string|null $orderId
     * @return string An EQ8 Score link for this order
     */
    public function getEQ8ScoreLink(string $orderId = null): string
    {
        if (!isset($orderId)) {
            return 'NA';
        }
        $eq8Score = $this->getEQ8Score($orderId);
        if (!isset($eq8Score)) {
            return 'NA';
        }
        $link = $this->config->getNS8IframeUrl($orderId);
        return '<a href="'.$link.'">'.$eq8Score.'</a>';
    }
}
