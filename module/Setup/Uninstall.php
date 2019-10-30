<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\UninstallInterface;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Logger;
use NS8\Protect\Helper\SwitchActionType;

class Uninstall implements UninstallInterface
{
    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * @var Logger
     */
    protected $logger;

    /**
     * Default constructor
     *
     * @param HttpClient $httpClient
     * @param Logger $logger
     */
    public function __construct(HttpClient $httpClient, Logger $logger)
    {
        $this->httpClient=$httpClient;
        $this->logger=$logger;
    }

    /**
     * Uninstall the extension
     *
     * @param SchemaSetupInterface $setup
     * @param ModuleContextInterface $context
     * @return void
     */
    public function uninstall(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        try {
            $setup->startSetup();
            $params = ['action'=>SwitchActionType::UNINSTALL_ACTION];
            $response = $this->httpClient->post('/switch/executor', $data, $params);
        } catch (Exception $e) {
            $this->logger->error('The order update could not be processed', $e);
        } finally {
            $setup->endSetup();
        }
    }
}
