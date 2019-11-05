<?php

namespace NS8\Protect\Api\Data;

use Magento\Framework\Api\ExtensionAttributesInterface;

/**
 * Interface for custom EAV column `eq8_score`
 */
interface Eq8ScoreInterface extends ExtensionAttributesInterface
{
    /**
     * @var string
     */
    const FIELD_NAME = 'eq8_score';

    /**
     * @var string
     */
    const VALUE = 'eq8_score';

    /**
     * Return value.
     *
     * @return string|null
     */
    public function getValue();

    /**
     * Set value.
     *
     * @param string|null $value
     * @return $this
     */
    public function setValue($value);
}
