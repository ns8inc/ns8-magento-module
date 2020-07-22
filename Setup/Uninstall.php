<?php
namespace NS8\Protect\Setup;

use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\UninstallInterface;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\Data\ProtectMetadata;
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
     * The logging client.
     *
     * @var LoggingClient
     */
    protected $loggingClient;

    /**
     * Default constructor
     *
     * @param Config $config
     */
    public function __construct(Config $config)
    {
        $this->config = $config;
        $this->config->initSdkConfiguration();
        $this->loggingClient = new LoggingClient();
    }

    /**
     * Uninstall a single merchant
     *
     * @param int $storeId - the id of the individual store getting uninstalled
     * @param ProtectMetadata $metadata - the store info
     */
    private function uninstallMerchant(int $storeId, ProtectMetadata $metadata): void
    {
        if (!$metadata->isActive) {
            return;
        }
        $this->config->initSdkConfiguration(true, $storeId);
        UninstallerClient::uninstall();
        $this->config->setIsMerchantActive($storeId, false);
    }

    /**
     * {@inheritdoc}
     */
    public function uninstall(SchemaSetupInterface $setup, ModuleContextInterface $context)
    {
        try {
            $setup->startSetup();
            $metadatas = $this->config->getStoreMetadatas();
            foreach ($metadatas as $id => $metadata) {
                $this->uninstallMerchant($id, $metadata);
            }
        } catch (Throwable $e) {
            $this->loggingClient->error('Protect uninstall failed', $e);
        } finally {
            $setup->endSetup();
        }
    }
}
