import axios from 'axios';
import { io } from 'socket.io-client';

// 自动检测：本地开发用 localhost，生产环境用相同域名（nginx代理）
const isDev = window.location.hostname === 'localhost';
const API_BASE_URL = isDev
  ? 'http://localhost:3001/api'
  : (process.env.REACT_APP_API_URL || '/api');

const SOCKET_URL = isDev
  ? 'http://localhost:3001'
  : (process.env.REACT_APP_API_URL?.replace('/api', '') || '');

// Axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.IO连接
const socket = io(SOCKET_URL || undefined, {
  autoConnect: false,
});

export { api, socket, API_BASE_URL, SOCKET_URL };
