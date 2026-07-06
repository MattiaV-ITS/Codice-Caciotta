import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

import { useApi } from "../services/apiService";

const AVAILABLE_ROLES = ["ROLE_USER", "ROLE_STAFF", "ROLE_ADMIN"];

const ROLE_LABELS = {
  ROLE_USER: "Utente",
  ROLE_STAFF: "Staff",
  ROLE_ADMIN: "Admin",
};

const AdminRoleManagement = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draftRoles, setDraftRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Consentire il rendering solo se l'utente è un admin
  const isAdmin = useMemo(() => {
    return user?.roles?.includes("ROLE_ADMIN");
  }, [user]);



  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadUsers = async () => {
      setLoading(true);
      setMessage(null);

      try {
        console.log('Fetching admin users...');
        
        // Crea una funzione per ottenere gli header di autorizzazione
        const getAuthHeaders = () => {
          if (!token) {
            return {
              'Content-Type': 'application/json',
            };
          }
          return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
        };
        
        const apiUrl = '/api/admin/users';
        console.log('Admin fetch URL:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        console.log('Admin users response status:', response.status);
        const data = await response.json();

        if (!response.ok) {
          console.error('Admin users fetch failed:', response.status, data);
          throw new Error(data.message || "Failed to fetch users");
        }

        setUsers(data);
        if (data.length > 0) {
          setSelectedUserId(data[0].id);
          setDraftRoles(data[0].roles || []);
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error.message || "Failed to fetch users. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin, token]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // Quando l'utente selezionato cambia, aggiorna i ruoli temporanei
  useEffect(() => {
    if (selectedUser) {
      setDraftRoles(selectedUser.roles || []);
      setMessage(null);
    }
  }, [selectedUser]);

  const toggleRole = (role) => {
    setDraftRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveRoles = async () => {
    if (!selectedUser) return;
    if (draftRoles.length === 0) {
      setMessage({ type: "error", text: "User must have at least one role." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      // Crea una funzione per ottenere gli header di autorizzazione
      const getAuthHeaders = () => {
        if (!token) {
          return {
            'Content-Type': 'application/json',
          };
        }
        return {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      };
      
      const apiUrl = `/api/admin/users/${selectedUser.username}/roles`;
      console.log('Admin update URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roles: draftRoles }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update roles");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, roles: [...draftRoles] } : u
        )
      );
      setMessage({ type: "success", text: data.message || "Roles updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update roles. Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Accesso Negato</h2>
        <p>Non hai i permessi per accedere a questa pagina.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24, padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Pannello Amministratore</h1>
          <p style={{ margin: 0, color: "#555" }}>Assegna ruoli agli utenti esistenti.</p>
        </div>
        {message?.type === "error" && (
          <p role="alert" style={{ margin: 0, color: "#b42318" }}>
            {message.text}
          </p>
        )}
        {loading ? (
            <p>Caricamento utenti...</p>
        ) : message?.type === "error" ? (
            <p role="alert" style={{ margin: 0, color: "#b42318" }}>
                {message.text}
            </p>
        ) : users.length === 0 ? (
            <p>Nessun utente trovato.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                style={{
                  cursor: "pointer",
                  padding: 16,
                  backgroundColor: user.id === selectedUserId ? "#eef6ff" : "#fff",
                  borderRadius: 12,
                  border: "1px solid #dbe4f0",
                  boxShadow: user.id === selectedUserId ? "0 8px 24px rgba(12, 68, 139, 0.08)" : "none",
                }}
                aria-selected={user.id === selectedUserId}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedUserId(user.id);
                  }
                }}
              >
                <strong>{user.username}</strong>
                <div style={{ color: "#555", marginTop: 4 }}>{user.email}</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  {user.roles?.map((role) => ROLE_LABELS[role] || role).join(", ") || "No roles"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ padding: 20, borderRadius: 16, border: "1px solid #dbe4f0", background: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Modifica ruoli</h2>
        {selectedUser ? (
          <>
            <p>
              Modifica ruoli per <strong>{selectedUser.username}</strong>
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {AVAILABLE_ROLES.map((role) => (
                <label key={role} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={draftRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />{" "}
                  <span>{ROLE_LABELS[role] || role}</span>
                </label>
              ))}
            </div>
            <button
              onClick={saveRoles}
              disabled={saving}
              style={{
                marginTop: 12,
                padding: "10px 18px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Salvataggio..." : "Salva Ruoli"}
            </button>
            {message && (
              <p
                style={{
                  marginTop: 12,
                  color: message.type === "error" ? "red" : "green",
                }}
                role="alert"
              >
                {message.text}
              </p>
            )}
          </>
        ) : (
          <p>Select a user to edit roles.</p>
        )}
      </section>
    </div>
  );
};

export default AdminRoleManagement;
