import { Routes, Route, Navigate } from 'react-router-dom';
import AnimaliLista from './components/AnimaliLista';
import ProprietariLista from './components/ProprietariLista';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import AdminRoleManagement from "./components/AdminRoleManagement";
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Caricamento...</div>;
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Caricamento...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;

  return user?.roles?.includes("ROLE_ADMIN")
    ? children
    : <Navigate to="/" replace />;
}

function StaffRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Caricamento...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;

  return user?.roles?.includes("ROLE_STAFF") || user?.roles?.includes("ROLE_ADMIN")
    ? children
    : <Navigate to="/" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/animali"
              element={
                <StaffRoute>
                  <AnimaliLista />
                </StaffRoute>
              }
            />

            <Route
              path="/proprietari"
              element={
                <StaffRoute>
                  <ProprietariLista />
                </StaffRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminRoleManagement />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
