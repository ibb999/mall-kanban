// 撤场管控表字段定义
const EXIT_FIELDS = [
  // 基础信息
  'serialNumber', 'storeNumber', 'tenant',
  // 店铺沟通
  'shopCommunication',
  // 喷绘围挡
  'workContactSheet', 'feeCollection', 'constructionArrangement',
  // 装修服务
  'restoreInterfaceBriefing', 'decorationAcceptance', 'feeCollectionExit',
  'constructionBriefingExit', 'constructionAcceptanceExit',
  // 店铺交接
  'shopHandover',
  // 商务服务
  'businessLicenseCancellation',
  // 其他
  'depositRefund', 'archiveFlow', 'notes',
  // 甘特图日期字段
  'exitNoticeDate', 'exitConstructionBriefingDate', 'exitConstructionDate',
  'exitCompletionAcceptanceDate', 'exitShopHandoverDate', 'exitScanTransferDate',
  'exitArchiveDate', 'licenseCancellationDate'
];

module.exports = { EXIT_FIELDS };
