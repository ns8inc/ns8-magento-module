<?php
namespace NS8\Protect\Model;

use Magento\Sales\Api\Data\OrderInterface;
use NS8\Protect\Api\OrderScoreInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;

/**
 * Custom API to set Order Score data
 * @link https://www.scommerce-mage.com/blog/magento-2-how-to-create-custom-api.html
 * @link https://magento.stackexchange.com/questions/106337/magento-2-custom-authentication-for-api
 * @link http://url.com
 */
class OrderScore implements OrderScoreInterface
{
    /**
     * @var Config
     */
    protected $config;

    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * Default constructor
     *
     * @param Config $config
     * @param HttpClient $httpClient
     */
    public function __construct(
        Config $config,
        HttpClient $httpClient
    ) {
        $this->config=$config;
        $this->httpClient=$httpClient;
    }

    /**
     * @api
     * @param string $orderId
     * @param int $eq8
     * @return bool true if the update succeeded
     */
    public function score($orderId, $eq8) : bool
    {
        $order = $this->config->getOrder($orderId);
        return $eq8 == $this->httpClient->setEQ8Score($eq8, $order);
    }
}
