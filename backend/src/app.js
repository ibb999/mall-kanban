const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entry');
const exitStoreRoutes = require('./routes/exitStore');
const logsRoutes = require('./routes/logs');
const exportRoutes = require('./routes/export');

const app = express();

// CORS
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', entryRoutes);
app.use('/api', exitStoreRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/export', exportRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storage: process.env.MONGODB_URI ? 'mongodb' : 'in-memory', timestamp: new Date().toISOString() });
});

// MongoDB 懒初始化（Vercel Serverless 兼容）
let dbInitialized = false;
async function initMongoDB() {
  if (dbInitialized) return;
  dbInitialized = true;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) return;

  const mongoose = require('mongoose');
  const entrySchema = new mongoose.Schema({
    storeNumber: String, serialNumber: String, openingDate: String,
    feeCollection: String, siteHandover: String,
    businessLicense: String, foodLicenseDeclaration: String, foodSiteVisit: String, licenseApplication: String,
    drawingReview: String,
    decorationAcceptance: String, decorationInsurance: String, constructionBriefing: String, constructionProgress: String, constructionAcceptance: String,
    staffProcessing: String, staffBriefing: String, openingApplication: String, paintingRemoval: String, archiveFlow: String, depositRefund: String, openingActivity: String,
    contentMaterial: String,
  }, { timestamps: true, strict: false });

  const exitSchema = new mongoose.Schema({
    storeNumber: String, serialNumber: String, tenant: String,
    shopCommunication: String, workOrder: String, feeCollection1: String, constructionArrangement: String,
    interfaceRestoration: String, decorationAcceptance: String, feeCollection2: String, constructionBriefing: String, constructionAcceptance: String,
    shopHandover: String, businessLicenseCancellation: String, depositRefund: String, archiveFlow: String, remarks: String,
  }, { timestamps: true, strict: false });

  const opLogSchema = new mongoose.Schema({
    operator: String, table: String, storeNumber: String,
    field: String, oldValue: String, newValue: String, actionTime: String,
  }, { timestamps: true });

  try {
    await mongoose.connect(uri);
    const EntryModel = mongoose.model('Entry', entrySchema);
    const ExitStoreModel = mongoose.model('ExitStore', exitSchema);
    const OperationLogModel = mongoose.model('OperationLog', opLogSchema);

    const store = require('./models/store');
    store.getAll = async (type) => {
      if (type === 'entry') return await EntryModel.find().lean();
      if (type === 'exitStore') return await ExitStoreModel.find().lean();
      if (type === 'operationLog') return await OperationLogModel.find().sort({ actionTime: -1 }).lean();
      return [];
    };
    store.findById = async (type, id) => {
      try { if (type === 'entry') return await EntryModel.findById(id).lean(); if (type === 'exitStore') return await ExitStoreModel.findById(id).lean(); return null; } catch { return undefined; }
    };
    store.create = async (type, data) => {
      if (type === 'entry') return (await new EntryModel(data).save()).toObject();
      if (type === 'exitStore') return (await new ExitStoreModel(data).save()).toObject();
      return null;
    };
    store.updateById = async (type, id, updates) => {
      if (type === 'entry') return await EntryModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (type === 'exitStore') return await ExitStoreModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      return null;
    };
    store.deleteById = async (type, id) => {
      if (type === 'entry') return !!(await EntryModel.findByIdAndDelete(id));
      if (type === 'exitStore') return !!(await ExitStoreModel.findByIdAndDelete(id));
      return false;
    };
    store.addOperationLog = async (log) => (await new OperationLogModel(log).save()).toObject();
    console.log('MongoDB connected (serverless)');
  } catch (err) {
    console.error('MongoDB init error:', err.message);
  }
}

// 中间件：首次 API 请求时初始化 MongoDB
app.use('/api', async (req, res, next) => {
  if (!dbInitialized) await initMongoDB();
  next();
});

module.exports = app;
