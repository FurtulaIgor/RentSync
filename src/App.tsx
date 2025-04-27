import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingsPage from './pages/BookingsPage';
import GuestsPage from './pages/GuestsPage';
import StatisticsPage from './pages/StatisticsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="font-inter text-gray-800 bg-gray-50 min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;