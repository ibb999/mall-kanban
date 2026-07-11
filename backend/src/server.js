const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupSocketIO } = require('./socket/socketHandler');

const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
setupSocketIO(io);
app.set('io', io);

// MongoDB 连接
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
      shopCommunication: String, workOrder: String, feeCollection1: String, constructionArrangement: String,
      interfaceRestoration: String, decorationAcceptance: String, feeCollection2: String, constructionBriefing: String, constructionAcceptance: String,
      shopHandover: String, businessLicenseCancellation: String, depositRefund: String, archiveFlow: String, remarks: String,
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
      console.error('MongoDB error:', err.message);
      console.log('Using in-memory storage');
      startHttpServer();
      return;
    }

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
  } else {
    console.log('MONGODB_URI not set, using in-memory storage');
  }
  startHttpServer();
}

function startHttpServer() {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

module.exports = { app, server, io };
