import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';  // <- Layout con Header integrato
import Login from './components/Login';
import Signup from './components/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';
import AnimaliLista from './components/AnimaliLista';
import AdminRoleManagement from "./components/AdminRoleManagement";
import { useAuth } from './context/AuthContext';
import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div> Caricamento...</div>;
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div> Caricamento...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return user?.roles?.includes("ROLE_ADMIN") ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      {/* Route pubbliche (SENZA Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Route protette (CON Layout - che include Header e Sidebar) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/animali" element={<AnimaliLista />} />
        <Route path="/admin" element={<AdminRoute><AdminRoleManagement /></AdminRoute>} />
        {/* Aggiungi qui altre route come /visite, /prenotazioni, /fatture, /ricette */}
      </Route>
    </Routes>
  );
}

export default App;