import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminPage from './pages/AdminPage';
import HomeDashboard from './components/HomeDashboard';
import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import { AuthProvider } from './contexts/AuthContext';
import GlobalLanguageSwitcher from './components/GlobalLanguageSwitcher';
import { VoiceInteractionProvider } from './contexts/VoiceInteractionContext';
import VoiceCommandListener from './components/VoiceCommandListener';

const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <VoiceInteractionProvider>
        <AuthProvider>
          <VoiceCommandListener />
          <GlobalLanguageSwitcher />
          <Routes>
            {/* Landing Page - Public */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Home Dashboard - First page after login */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomeDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Main App - Dashboard with tabs (accessed from HomeDashboard) */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/Admin" element={<AdminPage />} />
            
            {/* Redirect any unknown routes to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </VoiceInteractionProvider>
    </BrowserRouter>
  );
};

export default AppRouter;