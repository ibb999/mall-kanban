// 操作日志 Schema
const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema({
  operator: { type: String, required: true }, // 操作人姓名
  actionTime: { type: Date, default: Date.now },
  table: { type: String, enum: ['entry', 'exitStore'], required: true }, // 操作表名
  storeNumber: { type: String, required: true }, // 店铺ID
  field: { type: String, required: true }, // 修改字段
  oldValue: { type: String },
  newValue: { type: String },
}, { timestamps: true });

module.exports = operationLogSchema;
