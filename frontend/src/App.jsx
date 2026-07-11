import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';
import AnimaliLista from './pages/Animali/AnimaliLista';
import AnimaleDettaglio from './pages/Animali/AnimaleDettaglio';
import ProprietariLista from './pages/Proprietari/ProprietariLista';
import VaccinazioniLista from './pages/Vaccinazioni/VaccinazioniLista';
import VisiteScheda from './pages/Visite/VisitaScheda';


import PrenotazioniCalendario from './pages/Prenotazioni/PrenotazioniCalendario'; //TODO: elminare
import PrenotazioniProgramma from './pages/Prenotazioni/PrenotazioniProgramma'; //TODO: elminare


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

function StaffRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <div className="loading-spinner"><div className="spinner"></div> Caricamento...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return user?.roles?.includes("ROLE_STAFF") || user?.roles?.includes("ROLE_ADMIN")
    ? children
    : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/calendario" element={<PrenotazioniCalendario />} />  //TODO: elminare
      <Route path="/programma" element={<PrenotazioniProgramma />} />  //TODO: elminare

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/animali" element={<StaffRoute><AnimaliLista /></StaffRoute>} />
        <Route path="/animali/:id" element={<StaffRoute><AnimaleDettaglio /></StaffRoute>} />
        <Route path="/visite/:id" element={<StaffRoute><VisiteScheda /></StaffRoute>} />
        <Route path="/visite/new" element={<StaffRoute><VisiteScheda /></StaffRoute>} />
        <Route path="/proprietari" element={<StaffRoute><ProprietariLista /></StaffRoute>} />
        <Route path="/vaccinazioni" element={<StaffRoute><VaccinazioniLista /></StaffRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminRoleManagement /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default App;