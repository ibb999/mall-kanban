import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

function OperationLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link to="/exit" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                🚪 撤场管控表
              </Link>
              <Link to="/logs" className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900">
                📝 操作日志
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">操作日志</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">表类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">店铺号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">变更字段</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">旧值</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">新值</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, i) => (
                <tr key={log.id || i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.operator || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.actionTime || new Date().toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.table === 'entry' ? '入场' : log.table === 'exitStore' ? '撤场' : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.storeNumber || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.field || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.oldValue || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.newValue || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">暂无日志</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default OperationLogs;
