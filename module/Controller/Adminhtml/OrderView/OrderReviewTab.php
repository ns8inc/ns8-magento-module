<?php
namespace NS8\Protect\Controller\Adminhtml\OrderView;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Response\Http\FileFactory;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Controller\Result\Raw;
use Magento\Framework\Controller\Result\RawFactory;
use Magento\Framework\Registry;
use Magento\Framework\Translate\InlineInterface;
use Magento\Framework\View\LayoutFactory;
use Magento\Framework\View\Result\LayoutFactory as ResultLayoutFactory;
use Magento\Framework\View\Result\PageFactory;
use Magento\Sales\Api\OrderManagementInterface;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Controller\Adminhtml\Order;
use Psr\Log\LoggerInterface;

/**
 * Responsible for loading the renderer
 */
class OrderReviewTab extends Order
{
    /**
     * @var LayoutFactory
     */
    private $layoutFactory;

    /**
     * Location of the Block class this will load
     */
    const PATH_TO_TAB = 'NS8\Protect\Block\Adminhtml\Tab\OrderReview';

    /**
     * @param Context $context
     * @param Registry $coreRegistry
     * @param FileFactory $fileFactory
     * @param InlineInterface $translateInline
     * @param PageFactory $resultPageFactory
     * @param JsonFactory $resultJsonFactory
     * @param ResultLayoutFactory $resultLayoutFactory
     * @param RawFactory $resultRawFactory
     * @param OrderManagementInterface $orderManagement
     * @param OrderRepositoryInterface $orderRepository
     * @param LoggerInterface $logger
     * @param LayoutFactory $layoutFactory
     */
    public function __construct(
        Context $context,
        Registry $coreRegistry,
        FileFactory $fileFactory,
        InlineInterface $translateInline,
        PageFactory $resultPageFactory,
        JsonFactory $resultJsonFactory,
        ResultLayoutFactory $resultLayoutFactory,
        RawFactory $resultRawFactory,
        OrderManagementInterface $orderManagement,
        OrderRepositoryInterface $orderRepository,
        LoggerInterface $logger,
        LayoutFactory $layoutFactory
    ) {
        $this->layoutFactory = $layoutFactory;
        parent::__construct(
            $context,
            $coreRegistry,
            $fileFactory,
            $translateInline,
            $resultPageFactory,
            $resultJsonFactory,
            $resultLayoutFactory,
            $resultRawFactory,
            $orderManagement,
            $orderRepository,
            $logger
        );
    }

    /**
     * Loads the block handler for rendering the tab
     *
     * @return Raw
     */
    public function execute()
    {
        $this->_initOrder();
        $layout = $this->layoutFactory->create();
        $html = $layout->createBlock(self::PATH_TO_TAB)->toHtml();
        $this->_translateInline->processResponseBody($html);
        $resultRaw = $this->resultRawFactory->create();
        $resultRaw->setContents($html);
        return $resultRaw;
    }
}
