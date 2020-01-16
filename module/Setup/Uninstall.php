<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\UninstallInterface;
use Magento\Integration\Api\IntegrationServiceInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\SwitchActionType;
use NS8\ProtectSDK\Http\Client as HttpClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;

/**
 * Uninstall the Protect extension completely
 */
class Uninstall implements UninstallInterface
{
    /**
     * The HTTP client.
     *
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * The integration service interface.
     *
     * @var IntegrationServiceInterface
     */
    protected $integrationService;

    /**
     * The logging client.
     *
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * Default constructor
     *
     * @param IntegrationServiceInterface $integrationService,
     */
    public function __construct(IntegrationServiceInterface $integrationService)
    {
        $this->integrationService = $integrationService;
        $this->httpClient = new HttpClient();
        $this->loggingClient = new LoggingClient();
    }

    /**
     * {@inheritdoc}
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
        } catch (Throwable $e) {
            $this->loggingClient->error('Protect uninstall failed', $e);
        } finally {
            $setup->endSetup();
        }
    }
}
