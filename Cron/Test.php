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
     * Source of data to write to logs
     */
    const SOURCE_DIRECTORY = '/tmp/polling/';
    const MIN_FILE_INDEX = 0;
    const MAX_FILE_INDEX = 100;

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
    public function __construct(LoggerInterface $logger) {
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
            $fileList = glob(self::SOURCE_DIRECTORY.'*', GLOB_NOSORT);
            if (count($fileList) < 2) {
                return;

            }

            $file = self::SOURCE_DIRECTORY.self::MAX_FILE_INDEX;
            $renewingFile = self::SOURCE_DIRECTORY.self::MIN_FILE_INDEX;
            if (file_exists($file) && file_exists($renewingFile)) {
                $this->handleFile($file);
                return;
            }

            $fileList = array_map('basename', $fileList);
            $fileList = array_map('intval', $fileList);
            sort($fileList);
            for ($i=0; $i <count($fileList)-1; $i++) {
                $file = self::SOURCE_DIRECTORY.$fileList[$i];
                $this->handleFile($file);
            }

        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Handle the intended actions for an input file then delete it
     *
     * @param string $file The file path we want to process
     * @return bool True if successful
     */
    protected function handleFile(string $file) : bool
    {
        $logData = file($file);
        foreach ($logData as $line) {
            $this->logger->debug($line);
        }
        unlink($file);

        return true;
    }
}
