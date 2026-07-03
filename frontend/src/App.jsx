import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';  // <- importa il Layout
import Login from './components/Login';
import Signup from './components/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';  // <- nuova Dashboard
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
      {/* Route pubbliche (senza layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Route protette con Layout (Header + Sidebar + Content) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />  {/* <- Dashboard ora è la home */}
        <Route path="/animali" element={<AnimaliLista />} />  {/* <- Animali spostato su /animali */}
        <Route path="/admin" element={<AdminRoute><AdminRoleManagement /></AdminRoute>} />
        {/* Aggiungi qui altre route come /visite, /prenotazioni, /fatture, /ricette */}
      </Route>
    </Routes>
  );
}

export default App;