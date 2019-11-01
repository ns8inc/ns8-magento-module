<?php

namespace NS8\Protect\Ui\Component\Listing\Column;

use Magento\Framework\View\Element\UiComponent\ContextInterface;
use Magento\Framework\View\Element\UiComponentFactory;
use Magento\Ui\Component\Listing\Columns\Column;

use NS8\Protect\Helper\HttpClient;

/**
 * EQ8Score Column Class
 *
 * This class handles populating the data necessary for the
 * EQ8 Score Column in the Sales Order Grid
 */
class EQ8Score extends Column
{

    /**
     * The HTTP client helper.
     *
     * @var HttpClient
     */
    private $httpClient;

    /**
     * Constructor
     *
     * @param ContextInterface $context The Magento Context
     * @param UiComponentFactory $uiComponentFactory The UI Component Factory
     * @param array $components The components
     * @param array $data The data
     */
    public function __construct(
        ContextInterface $context,
        UiComponentFactory $uiComponentFactory,
        HttpClient $httpClient,
        array $components = [],
        array $data = []
    ) {
        $this->httpClient = $httpClient;
        parent::__construct($context, $uiComponentFactory, $components, $data);
    }

    /**
     * Loop through the Orders and check for an EQ8 Score
     * If none is present
     *  - Fetch it from Protect
     *  - Persist it
     *
     * @param array $dataSource The Orders we'll be looping through
     *
     * @return array
     */
    public function prepareDataSource(array $dataSource): array
    {
        if (isset($dataSource['data']['items'])) {
            foreach ($dataSource['data']['items'] as &$item) {
                $item['eq8_score'] = $this->getEQ8Score($item['increment_id']);
                if ($item['eq8_score'] === null) {
                    $item['eq8_score'] = 'TBD';
                }
            }
        }

        return $dataSource;
    }

    /**
     * Get the NS8 EQ8 score for the order.
     *
     * @param string $orderIncrementId The Order's Increment Id (ex.: "000000006")
     *
     * @return int|null The EQ8 score
     */
    public function getEQ8Score(string $orderIncrementId): ?int
    {
        $uri = '/orders/order-name/%s' . $this->base64UrlEncode($orderIncrementId);
        $req = $this->httpClient->get($uri);

        if (!isset($req->fraudAssessments)) {
            return null;
        }

        // The goal here is to look in the fraudAssessments array and return the first score we find that's an EQ8.
        return array_reduce($req->fraudAssessments, function (?int $foundScore, \stdClass $fraudAssessment): ?int {
            if (!empty($foundScore)) {
                return $foundScore;
            }

            return $fraudAssessment->providerType === 'EQ8' ? $fraudAssessment->score : null;
        });
    }

    /**
     * Encode a string using base64 in URL mode.
     *
     * @link https://en.wikipedia.org/wiki/Base64#URL_applications
     *
     * @param string $data The data to encode
     *
     * @return string The encoded string
     */
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
