// 入场管控表字段定义
const ENTRY_FIELDS = [
  // 基础信息
  'serialNumber', 'storeNumber', 'openingDate',
  // 费用与场地
  'feeCollection', 'siteHandover',
  // 商务服务
  'businessLicense', 'foodLicenseDeclaration', 'foodSiteVisit', 'licenseApplication',
  // 设计审核
  'drawingReview',
  // 装修服务
  'decorationAcceptance', 'decorationInsurance', 'constructionBriefing', 'constructionProgress', 'constructionAcceptance',
  // 开业服务
  'staffProcessing', 'staffBriefing', 'openingApplication', 'paintingRemoval', 'archiveFlow', 'depositRefund', 'openingActivity',
  // 内容服务
  'contentMaterial',
  // 甘特图日期字段
  'entryNoticeDate', 'entryHandoverDate', 'constructionBriefingDate', 'constructionApplyDate',
  'drawingReviewDate', 'metroConstructionApplyDate', 'depositPaymentDate', 'constructionStartDate',
  'completionAcceptanceDate', 'scanTransferDate', 'archiveDate', 'licenseProcessingDate',
  'powerLicenseDate', 'openingApplicationDate', 'staffTrainingDate', 'openingDate'
];

module.exports = { ENTRY_FIELDS };
