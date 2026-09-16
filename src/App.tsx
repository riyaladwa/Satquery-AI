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
import { Explore } from './pages/Explore';
import { Collaborate } from './pages/Collaborate';
import { SatQueryAssistant } from './components/common/SatQueryAssistant';
import { ProductTour } from './components/common/ProductTour';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AuthModal />
          <Routes>
            {/* 1. Landing Page: Minimal, Modern, Professional Overview */}
            <Route path="/" element={<MinimalLanding />} />

            {/* 2. Explore: Satellite Imagery Catalog */}
            <Route path="/explore" element={<Explore />} />

            {/* 3. Main Workstation: Clean Map + AI Copilot */}
            <Route path="/app" element={<MinimalDashboard />} />
            <Route path="/analyze" element={<MinimalDashboard />} />
            <Route path="/dashboard" element={<MinimalDashboard />} />

            {/* 4. History & My Work */}
            <Route path="/history" element={<MyWork />} />
            <Route path="/my-work" element={<MyWork />} />

            {/* 5. Reports Archive */}
            <Route path="/reports" element={<Reports />} />

            {/* 6. Bi-Temporal & Cross-Modal Change Detection */}
            <Route path="/compare" element={<Compare />} />

            {/* 7. Collaborative Projects Workspace */}
            <Route path="/collaborate" element={<Collaborate />} />

            {/* Fallback back to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Context-Aware AI Chatbot */}
          <SatQueryAssistant />

          {/* Lightweight 5-Step Product Tour */}
          <ProductTour />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
