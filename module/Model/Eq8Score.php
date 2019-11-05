<?php

namespace NS8\Protect\Model;
use NS8\Protect\Api\Data\Eq8ScoreInterface;

class Eq8Score implements Eq8ScoreInterface
{
    /**
     * {@inheritdoc}
     */
    public function getValue()
    {
        return $this->getData(self::FIELD_NAME);
    }

    /**
     * {@inheritdoc}
     */
    public function setValue($value)
    {
        return $this->setData(self::FIELD_NAME, $value);
    }
}
