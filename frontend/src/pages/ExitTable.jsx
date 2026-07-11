import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, socket } from '../services/api';
import ExitTableContent from '../components/ExitTableContent';

function ExitTable() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    socket.on('exitStore:update', (updatedRecord) => {
      setRecords(prev => {
        const index = prev.findIndex(r => r.id === updatedRecord.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedRecord;
          return updated;
        }
        return [...prev, updatedRecord];
      });
    });

    socket.on('exitStore:deleted', (deletedId) => {
      setRecords(prev => prev.filter(r => r.id !== deletedId));
    });

    return () => {
      socket.off('exitStore:update');
      socket.off('exitStore:deleted');
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/exitStore');
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to fetch exit records:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/exitStore/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '撤场管控表.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                📊 仪表盘
              </Link>
              <Link to="/entry" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                🏢 入场管控表
              </Link>
              <Link to="/exit" className="inline-flex items-center px-1 pt-1 border-b-2 border-red-500 text-sm font-medium text-gray-900">
                🚪 撤场管控表
              </Link>
              <Link to="/logs" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                📝 操作日志
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                📥 导出Excel
              </button>
              <span className="text-sm text-gray-600">
                当前用户: {JSON.parse(localStorage.getItem('currentUser') || '{}').username || '未知'}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('currentUser');
                  window.location.href = '/login';
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">撤场管控表</h1>
            <p className="text-sm text-gray-500 mt-1">管理所有商铺撤场进度（共 {records.length} 条）</p>
          </div>
          <AddExitModal records={records} setRecords={setRecords} />
        </div>

        <ExitTableContent records={records} setRecords={setRecords} />
      </main>
    </div>
  );
}

// 新增撤场记录弹窗
function AddExitModal({ records, setRecords }) {
  const [isOpen, setIsOpen] = useState(false);
  const [storeNumber, setStoreNumber] = useState('');
  const [tenant, setTenant] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/exitStore', {
        storeNumber,
        tenant,
        serialNumber: (records.length + 1).toString(),
      });
      setRecords([...records, response.data]);
      setIsOpen(false);
      setStoreNumber('');
      setTenant('');
    } catch (err) {
      console.error('Failed to create exit record:', err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
      >
        ➕ 新增撤场记录
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">新增撤场记录</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店铺号</label>
            <input
              type="text"
              value={storeNumber}
              onChange={(e) => setStoreNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
              placeholder="请输入店铺号"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">租户</label>
            <input
              type="text"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
              placeholder="请输入租户名称"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              确定
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExitTable;
