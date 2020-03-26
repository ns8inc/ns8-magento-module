<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\UninstallInterface;
use Magento\Integration\Api\IntegrationServiceInterface;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Actions\Client as ActionsClient;
use NS8\ProtectSDK\Logging\Client as LoggingClient;
use NS8\ProtectSDK\Uninstaller\Client as UninstallerClient;

/**
 * Uninstall the Protect extension completely
 */
class Uninstall implements UninstallInterface
{
    /**
     * The Config helper.
     *
     * @var Config
     */
    protected $config;

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
     * @param Config $config
     * @param IntegrationServiceInterface $integrationService,
     */
    public function __construct(
        Config $config,
        IntegrationServiceInterface $integrationService
    ) {
        $this->config = $config;
        $this->integrationService = $integrationService;
        $this->loggingClient = new LoggingClient();
    }

    /**
     * {@inheritdoc}
     */
    public function uninstall(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        try {
            $setup->startSetup();
            $this->config->initSdkConfiguration();
            UninstallerClient::uninstall();
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
