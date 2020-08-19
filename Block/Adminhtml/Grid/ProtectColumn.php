<?php

namespace NS8\Protect\Block\Adminhtml\Grid;

use Magento\Backend\Block\Widget\Grid\Column\Renderer\AbstractRenderer;
use Magento\Framework\DataObject;
use NS8\Protect\Helper\Config;

/**
 * Logic for rendering the protect status column
 */
class ProtectColumn extends AbstractRenderer
{

    /**
     * Constructs the column class
     *
     * @param Config $config
     */
    public function __construct(Config $config)
    {
        $this->config = $config;
    }

    /**
     * Renders grid column
     * renders nothing if there is no store view
     * because we activate based on store view, not website or store group
     *
     * @param   DataObject $row
     * @return  string
     */
    public function render(DataObject $row): string
    {
        $id = $row->getStoreId();
        if (!$id) {
            return '';
        }
        $active = $this->config->isMerchantActive($row->getStoreId());
        $func = "activateShop";
        $label = "Activate";
        $btnStyle= "primary";
        if ($active) {
            $func = "deactivateShop";
            $label = "Deactivate";
            $btnStyle= "secondary";
        }
        return '<button style="width: 100%" onclick=shops.'. $func .'(' . $id . ')
                type="button" class="action-default scalable add ' . $btnStyle . '">
                    <span data-mage-init=\'{"loader": {"icon": "" }}\' id="toggle-'.$id.'">' . $label . '</span>
                </button>';
    }
}
