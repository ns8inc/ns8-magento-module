<?php
namespace NS8\Protect\Cron;

use NS8\Protect\Polling\Client as PollingClient;
use Psr\Log\LoggerInterface;

/**
 * Cron-job to permit polling to NS8 Protect Services
 */
class Test
{
    /**
     * Logging attribute
     * @var LoggerInterface $logger
     */
    protected $logger;

    /**
     * Default constructor
     *
     * @param Psr\Log\LoggerInterfac $logger
     *
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Execute cron job to process messages from the NS8 Protect
     *
     * @return void
     */
    public function execute() : void
    {
        try {
            PollingClient::startService();

            $fileList = PollingClient::getFileList();
            foreach ($fileList as $baseFile) {
                $this->handleFile($baseFile);
            }
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Handle the intended actions for an input file then delete it
     *
     * @param string $file The file path we want to process
     *
     * @return bool True if successful
     */
    protected function handleFile(string $fileName) : bool
    {
        try {
            $filePath = PollingClient::getFullFilePath($fileName);
            $logData = file($filePath);
            foreach ($logData as $line) {
                $this->logger->debug($line);
            }

            PollingClient::removeFile($fileName);
            return true;
        } catch (\Throwable $t) {
            return false;
        }
    }
}
