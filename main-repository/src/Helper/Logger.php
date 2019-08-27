<?php
namespace NS8\CSP2\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Backend\Block\Template\Context;
use Psr\Log\LoggerInterface;

use NS8\CSP2\Helper\Config;
use NS8\CSP2\Helper\HttpClient;

/**
 * Generic logging utility class. This will attempt to log to Magento and to our own API.
 */
class Logger extends AbstractHelper
{
    protected $logger;
    protected $httpClient;
    protected $config;

    /**
     * Default constructor
     *
     * @param LoggerInterface $loggerInterface
     * @param Config $config
     * @param HttpClient $httpClient
     */
    public function __construct(
        LoggerInterface $loggerInterface,
        Config $config,
        HttpClient $httpClient
    ) {
        $this->logger = $loggerInterface;
        $this->config = $config;
        $this->httpClient = $httpClient;
    }

    /**
     * Logs an error
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return bool Logging never fails and always returns true.
     */
    public function error($message, $data = null, $function = 'Some Method')
    {
        return $this->log('ERROR', $message, $data, $function);
    }

    /**
     * Logs a debug
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return bool Logging never fails and always returns true.
     */
    public function debug($message, $data = null, $function = 'Some Method')
    {
        return $this->log('DEBUG', $message, $data, $function);
    }

    /**
     * Logs a warn
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return bool Logging never fails and always returns true.
     */
    public function warn($message, $data = null, $function = 'Some Method')
    {
        return $this->log('WARN', $message, $data, $function);
    }

    /**
     * Logs an info
     *
     * @param string $message
     * @param mixed $data
     * @param string $function
     * @return bool Logging never fails and always returns true.
     */
    public function info($message, $data = null, $function = 'Some Method')
    {
        return $this->log('INFO', $message, $data, $function);
    }

    /**
     * Internal method to handle logging
     *
     * @param string $level Verbosity. Default 'ERROR'. Accepts 'INFO','WARN','DEBUG','ERROR'.
     * @param string $message Any log message content.
     * @param mixed $data Optional object data.
     * @param string $function Option method name.
     * @return bool Logging never fails and always returns true.
     */
    private function log($level = 'ERROR', $message = 'Log Message', $data = null, $function = 'Some Method')
    {
        try {
            //Log to Magento
            $this->logger->log($level, $message, array('data'=>$data));

            //Structure some data for our API to consume later
            $data = [
                'level' => $level,
                'category' => 'magento NS8_CSP2',
                'data' => [
                    'platform' => 'magento',
                    'function' => $function,
                    'message' => $log,
                    'data' => $data,
                    'phpVersion' => PHP_VERSION,
                    'phpOS' => PHP_OS
                ]
            ];
            //Log to our own API
            $this->httpClient->post('logs', $data);
        } catch (\Exception $e) {
            $this->logger->log('ERROR', 'NS8_CSP2.log: '.$e->getMessage(), $e);
        } finally {
            return true;
        }
    }
}
