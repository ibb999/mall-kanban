const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { setupSocketIO } = require('./socket/socketHandler');
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entry');
const exitStoreRoutes = require('./routes/exitStore');
const logsRoutes = require('./routes/logs');
const exportRoutes = require('./routes/export');

const app = express();
const server = http.createServer(app);

// CORS - 允许前端域名
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'https://mall-kanban.vercel.app'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setupSocketIO(io);
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', entryRoutes);
app.use('/api', exitStoreRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/export', exportRoutes);

// 静态文件（生产环境）
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: 'in-memory',
    timestamp: new Date().toISOString(),
  });
});

// MongoDB 连接（可选，设置 MONGODB_URI 环境变量启用）
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  if (MONGODB_URI) {
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
      shopCommunication: String,
      workOrder: String, feeCollection1: String, constructionArrangement: String,
      interfaceRestoration: String, decorationAcceptance: String, feeCollection2: String, constructionBriefing: String, constructionAcceptance: String,
      shopHandover: String,
      businessLicenseCancellation: String,
      depositRefund: String, archiveFlow: String, remarks: String,
    }, { timestamps: true, strict: false });

    const opLogSchema = new mongoose.Schema({
      operator: String, table: String, storeNumber: String,
      field: String, oldValue: String, newValue: String, actionTime: String,
    }, { timestamps: true });

    const EntryModel = mongoose.model('Entry', entrySchema);
    const ExitStoreModel = mongoose.model('ExitStore', exitSchema);
    const OperationLogModel = mongoose.model('OperationLog', opLogSchema);

    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      console.log('Falling back to in-memory storage');
      return startHttpServer();
    }

    // 替换 store 方法为 MongoDB 实现
    const originalStore = require('./models/store');
    originalStore.getAll = async function(type) {
      if (type === 'entry') return await EntryModel.find().lean();
      if (type === 'exitStore') return await ExitStoreModel.find().lean();
      if (type === 'operationLog') return await OperationLogModel.find().sort({ actionTime: -1 }).lean();
      return [];
    };
    originalStore.findById = async function(type, id) {
      try {
        if (type === 'entry') return await EntryModel.findById(id).lean();
        if (type === 'exitStore') return await ExitStoreModel.findById(id).lean();
        return null;
      } catch { return undefined; }
    };
    originalStore.create = async function(type, data) {
      if (type === 'entry') return (await new EntryModel(data).save()).toObject();
      if (type === 'exitStore') return (await new ExitStoreModel(data).save()).toObject();
      return null;
    };
    originalStore.updateById = async function(type, id, updates) {
      if (type === 'entry') return await EntryModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (type === 'exitStore') return await ExitStoreModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      return null;
    };
    originalStore.deleteById = async function(type, id) {
      if (type === 'entry') return !!(await EntryModel.findByIdAndDelete(id));
      if (type === 'exitStore') return !!(await ExitStoreModel.findByIdAndDelete(id));
      return false;
    };
    originalStore.addOperationLog = async function(log) {
      return (await new OperationLogModel(log).save()).toObject();
    };
  } else {
    console.log('MONGODB_URI not set, using in-memory storage');
  }
  startHttpServer();
}

function startHttpServer() {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO ready for real-time collaboration`);
  });
}

startServer();

module.exports = { app, server, io };
