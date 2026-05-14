import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useBankStore } from './store/bankStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransferPage from './pages/TransferPage';
import AirtimePage from './pages/AirtimePage';
import BillsPage from './pages/BillsPage';
import CableTvPage from './pages/CableTvPage';
import SavingsPage from './pages/SavingsPage';
import TransactionsPage from './pages/TransactionsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useBankStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useBankStore((s) => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
        <Route path="/airtime" element={<ProtectedRoute><AirtimePage /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
        <Route path="/cable-tv" element={<ProtectedRoute><CableTvPage /></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><SavingsPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
