import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { MinimalLanding } from './pages/MinimalLanding';
import { MinimalDashboard } from './pages/MinimalDashboard';
import { MyWork } from './pages/MyWork';
import { Reports } from './pages/Reports';
import { Compare } from './pages/Compare';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AuthModal />
          <Routes>
          {/* 1. Landing Page: Minimal, Modern, Professional Overview */}
          <Route path="/" element={<MinimalLanding />} />

          {/* 2. Main Workstation: Clean Map + AI Copilot */}
          <Route path="/app" element={<MinimalDashboard />} />
          <Route path="/dashboard" element={<MinimalDashboard />} />

          {/* 3. History & My Work */}
          <Route path="/history" element={<MyWork />} />
          <Route path="/my-work" element={<MyWork />} />

          {/* 4. Reports Archive */}
          <Route path="/reports" element={<Reports />} />

          {/* 5. Bi-Temporal Change Detection */}
          <Route path="/compare" element={<Compare />} />

          {/* Fallback back to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </LanguageProvider>
  );
};

export default App;
