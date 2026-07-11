import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, socket } from '../services/api';
import EntryTableContent from '../components/EntryTableContent';

function EntryTable() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // 连接Socket.IO
    socket.on('entry:update', (updatedEntry) => {
      setEntries(prev => {
        const index = prev.findIndex(e => e.id === updatedEntry.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedEntry;
          return updated;
        }
        return [...prev, updatedEntry];
      });
    });

    socket.on('entry:deleted', (deletedId) => {
      setEntries(prev => prev.filter(e => e.id !== deletedId));
    });

    return () => {
      socket.off('entry:update');
      socket.off('entry:deleted');
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/entry');
      setEntries(response.data);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/entry/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '入场管控表.xlsx');
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
              <Link to="/entry" className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900">
                🏢 入场管控表
              </Link>
              <Link to="/exit" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
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
            <h1 className="text-2xl font-bold text-gray-900">入场管控表</h1>
            <p className="text-sm text-gray-500 mt-1">管理所有商铺入场进度（共 {entries.length} 条）</p>
          </div>
          <AddEntryModal entries={entries} setEntries={setEntries} />
        </div>

        <EntryTableContent entries={entries} setEntries={setEntries} />
      </main>
    </div>
  );
}

// 新增入场记录弹窗
function AddEntryModal({ entries, setEntries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [storeNumber, setStoreNumber] = useState('');
  const [openingDate, setOpeningDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/entry', {
        storeNumber,
        openingDate,
        serialNumber: (entries.length + 1).toString(),
      });
      setEntries([...entries, response.data]);
      setIsOpen(false);
      setStoreNumber('');
      setOpeningDate('');
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
      >
        ➕ 新增入场记录
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">新增入场记录</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店铺号</label>
            <input
              type="text"
              value={storeNumber}
              onChange={(e) => setStoreNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="请输入店铺号"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开业日期</label>
            <input
              type="text"
              value={openingDate}
              onChange={(e) => setOpeningDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="请输入开业日期"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
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

export default EntryTable;
