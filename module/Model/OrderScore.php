<?php
namespace NS8\Protect\Model;

use Magento\Sales\Api\Data\OrderInterface;
use NS8\Protect\Api\OrderScoreInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;

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
     * @param string $eq8
     * @return OrderInterface EQ8 Score.
     */
    public function score($orderId, $eq8)
    {
        $order = $this->config->getOrder($orderId);
        return $this->httpClient->setEQ8Score($eq8, $order);
    }
}
