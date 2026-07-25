import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import { Dashboard } from './pages/Dashboard/Dashboard';
import AnimaliLista from './pages/Animali/AnimaliLista';

import SchedaAnimale from './pages/Animali/SchedaAnimale';
import ProprietariLista from './pages/Proprietari/ProprietariLista';
import VaccinazioniLista from './pages/Vaccinazioni/VaccinazioniLista';
import VisitePagina from './pages/Visite/VisitePagina';
import AnimaleDettaglio from './pages/Animali/AnimaleDettaglio';
import PrestazioniLista from './pages/Prestazioni/PrestazioniLista';
import PrestazioneCreate from './pages/Prestazioni/PrestazioneCreate';

import DashboardUser from './pages/Dashboard/DashboardUser';
import AnimaleDettaglioUser from './pages/Animali/AnimaleDettaglioUser';

import PrenotazioniCalendario from './pages/Prenotazioni/PrenotazioniCalendario';
import PrenotazioniProgramma from './pages/Prenotazioni/PrenotazioniProgramma';


import AdminRoleManagement from "./components/AdminRoleManagement";
import StudioHoursAdmin from "./pages/StudioHours/StudioHoursAdmin";
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
      <Route path="/prenotazioni" element={<StaffRoute><PrenotazioniProgramma /></StaffRoute>} />
      <Route path="/prenotazioni/calendario" element={<StaffRoute><PrenotazioniCalendario /></StaffRoute>} />
      <Route path="/prenotazioni/programma" element={<StaffRoute><PrenotazioniProgramma /></StaffRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/animali" element={<StaffRoute><AnimaliLista /></StaffRoute>} />
        <Route path="/animali/:id" element={<StaffRoute><AnimaleDettaglio /></StaffRoute>} />
        <Route path="/visite/:id" element={<StaffRoute><VisitePagina /></StaffRoute>} />
        <Route path="/visite/new" element={<StaffRoute><VisitePagina /></StaffRoute>} />
        <Route path="/proprietari" element={<StaffRoute><ProprietariLista /></StaffRoute>} />
<Route path="/prestazioni" element={<StaffRoute><PrestazioniLista /></StaffRoute>} />
<Route path="/prestazioni/create" element={<StaffRoute><PrestazioneCreate /></StaffRoute>} />
        <Route path="/vaccinazioni" element={<StaffRoute><VaccinazioniLista /></StaffRoute>} />
        <Route path="/dashboard/user" element={<ProtectedRoute><DashboardUser /></ProtectedRoute>} />
        <Route path="/animali/user/:id" element={<ProtectedRoute><AnimaleDettaglioUser /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminRoleManagement /></AdminRoute>} />
        <Route path="/admin/orari" element={<AdminRoute><StudioHoursAdmin /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default App;