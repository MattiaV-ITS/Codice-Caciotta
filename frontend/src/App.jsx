import { Routes, Route, Navigate } from 'react-router-dom';
import AnimaliLista from './components/AnimaliLista';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';
import AdminRoleManagement from "./components/AdminRoleManagement";

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

function App() {
  return (
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
                <AnimaliLista />
              </ProtectedRoute>
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
  );
}

export default App;
