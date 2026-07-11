// 入场管控表 Schema
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  storeNumber: { type: String, required: true }, // 店铺号
  openingDate: { type: String }, // 开业日期
  serialNumber: { type: String },
  // 费用与场地
  feeCollection: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  siteHandover: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 商务服务
  businessLicense: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  foodLicenseDeclaration: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  foodSiteVisit: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  licenseApplication: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 设计审核
  drawingReview: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 装修服务
  decorationAcceptance: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  decorationInsurance: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  constructionBriefing: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  constructionProgress: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  constructionAcceptance: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 开业服务
  staffProcessing: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  staffBriefing: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  openingApplication: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  paintingRemoval: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  archiveFlow: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  depositRefund: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  openingActivity: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 内容服务
  contentMaterial: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 甘特图日期字段
  startDate: { type: String },
  endDate: { type: String },
}, { timestamps: true });

module.exports = entrySchema;
