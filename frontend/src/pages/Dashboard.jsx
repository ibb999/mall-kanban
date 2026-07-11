import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { api } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 导出全部数据的函数
async function handleExportAll() {
  try {
    const res = await api.get('/export/export-all', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '商场商户管理全部数据.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败，请重试');
  }
}

function Dashboard() {
  const [entryData, setEntryData] = useState([]);
  const [exitData, setExitData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entryRes, exitRes] = await Promise.all([
        api.get('/entry'),
        api.get('/exitStore'),
      ]);
      setEntryData(entryRes.data);
      setExitData(exitRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = (data) => {
    const counts = { '未开始': 0, '进行中': 0, '已完成': 0, '不适用': 0 };
    data.forEach(item => {
      Object.values(item).forEach(val => {
        if (counts.hasOwnProperty(val)) {
          counts[val]++;
        }
      });
    });
    return counts;
  };

  const entryStatus = getStatusCounts(entryData);
  const exitStatus = getStatusCounts(exitData);

  const entryChartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: '入场管控状态分布', font: { size: 14 } },
    },
  };

  const exitChartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: '撤场管控状态分布', font: { size: 14 } },
    },
  };

  const entryChartData = {
    labels: ['未开始', '进行中', '已完成', '不适用'],
    datasets: [
      {
        label: '入场管控',
        data: [
          entryStatus['未开始'],
          entryStatus['进行中'],
          entryStatus['已完成'],
          entryStatus['不适用'],
        ],
        backgroundColor: ['#9CA3AF', '#3B82F6', '#10B981', '#E5E7EB'],
      },
    ],
  };

  const exitChartData = {
    labels: ['未开始', '进行中', '已完成', '不适用'],
    datasets: [
      {
        label: '撤场管控',
        data: [
          exitStatus['未开始'],
          exitStatus['进行中'],
          exitStatus['已完成'],
          exitStatus['不适用'],
        ],
        backgroundColor: ['#9CA3AF', '#3B82F6', '#10B981', '#E5E7EB'],
      },
    ],
  };

  // 待处理事项：未进入终态的店铺数量
  const pendingCount = entryData.filter(item => 
    Object.values(item).some(val => val === '进行中' || val === '未开始')
  ).length + exitData.filter(item => 
    Object.values(item).some(val => val === '进行中' || val === '未开始')
  ).length;

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
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900">
                📊 仪表盘
              </Link>
              <Link to="/entry" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                🏢 入场管控表
              </Link>
              <Link to="/exit" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                🚪 撤场管控表
              </Link>
              <Link to="/logs" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:text-gray-700 text-sm font-medium text-gray-500">
                📝 操作日志
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                当前用户: {JSON.parse(localStorage.getItem('currentUser') || '{}').username || '未知'}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('currentUser');
                  window.location.href = '/login';
                }}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">运营概览</h1>
          <p className="text-sm text-gray-500 mt-1">实时监控入场与撤场商铺进度</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">入场店铺总数</div>
            <div className="mt-2 text-3xl font-semibold text-blue-600">{entryData.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">撤场店铺总数</div>
            <div className="mt-2 text-3xl font-semibold text-red-600">{exitData.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">本月新增目标</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">10 家</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">待处理事项</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-600">{pendingCount}</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <Bar options={entryChartOptions} data={entryChartData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Bar options={exitChartOptions} data={exitChartData} />
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/entry" className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              <div className="text-2xl mr-3">🏢</div>
              <div>
                <div className="font-medium text-gray-900">入场管控表</div>
                <div className="text-sm text-gray-500">编辑入场进度</div>
              </div>
            </Link>
            <Link to="/exit" className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors">
              <div className="text-2xl mr-3">🚪</div>
              <div>
                <div className="font-medium text-gray-900">撤场管控表</div>
                <div className="text-sm text-gray-500">编辑撤场进度</div>
              </div>
            </Link>
            <button
              onClick={handleExportAll}
              className="flex cursor-pointer items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors"
            >
              <div className="text-2xl mr-3">📥</div>
              <div>
                <div className="font-medium text-gray-900">导出Excel</div>
                <div className="text-sm text-gray-500">下载全部数据</div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
