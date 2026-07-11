// 撤场管控表 Schema
const mongoose = require('mongoose');

const exitStoreSchema = new mongoose.Schema({
  storeNumber: { type: String, required: true },
  tenant: { type: String },
  serialNumber: { type: String },
  shopCommunication: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 喷绘围挡
  workOrder: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  feeCollection1: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  constructionArrangement: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 装修服务
  interfaceRestoration: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  decorationAcceptance: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  feeCollection2: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  constructionBriefing: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  constructionAcceptance: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 店铺交接
  shopHandover: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 商务服务
  businessLicenseCancellation: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  // 其他
  depositRefund: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  archiveFlow: { type: String, enum: ['未开始', '进行中', '已完成', '不适用'], default: '未开始' },
  remarks: { type: String },
  // 甘特图日期字段
  startDate: { type: String },
  endDate: { type: String },
}, { timestamps: true });

module.exports = exitStoreSchema;
