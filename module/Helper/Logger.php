<?php

namespace NS8\Protect\Helper;

use Exception;
use Magento\Framework\App\Helper\AbstractHelper;
use NS8\Protect\Helper\Config;
use NS8\Protect\Helper\HttpClient;
use Psr\Log\LoggerInterface;

/**
 * Generic logging utility class. This will attempt to log to Magento and to our own API.
 */
class Logger extends AbstractHelper
{
    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * Default constructor
     *
     * @param HttpClient $httpClient
     * @param LoggerInterface $logger
     */
    public function __construct(
        HttpClient $httpClient,
        LoggerInterface $logger
    ) {
        $this->httpClient = $httpClient;
        $this->logger = $logger;
    }

    /**
     * Logs an error
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return void Logging never fails.
     */
    public function error($message, $data = null, $function = 'Unknown'): void
    {
        $this->log('ERROR', $message, $data, $function);
    }

    /**
     * Logs a debug
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return void Logging never fails.
     */
    public function debug($message, $data = null, $function = 'Unknown'): void
    {
        $this->log('DEBUG', $message, $data, $function);
    }

    /**
     * Logs a warn
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return void Logging never fails.
     */
    public function warn($message, $data = null, $function = 'Unknown'): void
    {
        $this->log('WARN', $message, $data, $function);
    }

    /**
     * Logs an info
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return void Logging never fails.
     */
    public function info($message, $data = null, $function = 'Unknown'): void
    {
        $this->log('INFO', $message, $data, $function);
    }

    /**
     * Internal method to handle logging
     *
     * @param string $level Verbosity. Default 'ERROR'. Accepts 'INFO','WARN','DEBUG','ERROR'.
     * @param string $message Any log message content.
     * @param mixed $data Optional object data.
     * @param string $function Option method name.
     * @return void Logging never fails.
     */
    private function log($level = 'ERROR', $message = 'Log Message', $data = null, $function = 'Unknown'): void
    {
        try {
            //Log to Magento
            $this->logger->log($level, $message, ['data' => $data]);

            //Structure some data for our API to consume later
            $data = [
                'level' => $level,
                'category' => 'magento ' . Config::NS8_INTEGRATION_NAME,
                'data' => [
                    'platform' => 'magento',
                    'function' => $function,
                    'message' => $message,
                    'data' => $data,
                    'phpVersion' => PHP_VERSION,
                    'phpOS' => PHP_OS
                ]
            ];
            //Log to our own API
            $this->httpClient->post('/util/log-client-error', $data);
        } catch (Exception $e) {
            $this->logger->log('ERROR', Config::NS8_MODULE_NAME . '.log: ' . $e->getMessage(), ['error' => $e]);
        }
    }
}
