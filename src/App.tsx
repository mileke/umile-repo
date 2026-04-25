/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TooltipProvider } from './components/ui/tooltip';

import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import AIChat from './pages/AIChat';
import Login from './pages/Login';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="chat" element={<AIChat />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}
