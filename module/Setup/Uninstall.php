<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\UninstallInterface;
use Magento\Integration\Api\IntegrationServiceInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;
use NS8\Protect\Helper\Logger;
use NS8\Protect\Helper\SwitchActionType;

class Uninstall implements UninstallInterface
{
    /**
     * @var IntegrationServiceInterface
     */
    protected $integrationService;

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
     * @param IntegrationServiceInterface $integrationService,
     * @param Logger $logger
     */
    public function __construct(
        HttpClient $httpClient,
        IntegrationServiceInterface $integrationService,
        Logger $logger
    ) {
        $this->httpClient=$httpClient;
        $this->integrationService=$integrationService;
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
            $response = $this->httpClient->post('/switch/executor', [], $params);
            $integration = $this->integrationService->findByName(Config::NS8_INTEGRATION_NAME);
            if ($integration) {
                $integration->delete();
            }
        } catch (Exception $e) {
            $this->logger->error('Protect uninstall failed', $e);
        } finally {
            $setup->endSetup();
        }
    }
}
