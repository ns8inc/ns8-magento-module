<?php
namespace NS8\Protect\Helper;

use Magento\Framework\App\Helper\AbstractHelper;
use NS8\Protect\Helper\Config;
use NS8\ProtectSDK\Http\Client as HttpClient;
use NS8\ProtectSDK\Queue\Client as QueueClient;
use Zend\Http\Client as ZendClient;

/**
 * Helper to assist with queue functionality
 */
class Queue extends AbstractHelper
{
    /**
     * @var Config
     */
    protected $config;

    /**
     * Default constructor
     *
     * @param Config $config
     */
    public function __construct(Config $config)
    {
        $this->config = $config;
    }

    /**
     * Fetches messages from a queue
     *
     * @return mixed[] Array of messages
     */
    public function getMessages(): ?array
    {
        try {
            $messages = QueueClient::getMessages();
        } catch (\Exception $e) {
            $this->loggingClient->error('Unable to fetch messages');
            $messages = null;
        }

        return $messages;
    }

    /**
     * Deletes a message from a queue
     *
     * @param string $messageId - The ID of the message we want to delete
     *
     * @return bool true if the message was successfully deleted, otherwise false
     *
     */
    public function deleteMessage(string $messageId) : bool
    {
        $returnValue = true;
        try {
            QueueClient::deleteMessage($messageId);
        } catch (\Exception $e) {
            $this->loggingClient->error(sprintf('Unable to delete message: %s', $messageId));
            $returnValue = false;
        }

        return $returnValue;
    }

    public function setNs8HttpClient(HttpClient $ns8HttpClient) : void
    {
        try {
            QueueClient::setNs8HttpClient($ns8HttpClient);
        } catch (\Exception $e) {
            $this->loggingClient->error('Unable to set NS8 HTTP Client message: %s');
            throw $e;
        }
    }

    public function setQueueUrl(string $queueUrl) : void
    {
        try {
            QueueClient::initialize(null, $queueUrl);
        } catch (\Exception $e) {
            $this->loggingClient->error('Unable to set Queue URL');
            throw $e;
        }
    }

    public function fetchQueueUrl(int $storeId) : string
    {
        try {
            $this->config->initSdkConfiguration($storeId);
            $sdkHttpClient = new HttpClient();
            $urlData = $sdkHttpClient->post(QueueClient::GET_QUEUE_URL);
            return $urlData->url;
        } catch (\Exceotion $e) {
            $this->loggingClient->error('Unable to fetch Queue URL');
            throw $e;
        }
    }
}
