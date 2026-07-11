import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EntryTable from './pages/EntryTable';
import ExitTable from './pages/ExitTable';
import OperationLogs from './pages/OperationLogs';
import GanttViewPage from './components/GanttChart';
import { socket } from './services/api';

// 受保护的路由组件
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entry"
          element={
            <ProtectedRoute>
              <EntryTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exit"
          element={
            <ProtectedRoute>
              <ExitTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <OperationLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gantt"
          element={
            <ProtectedRoute>
              <GanttViewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
