import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AVAILABLE_ROLES = ["ROLE_ADMIN", "ROLE_STAFF", "ROLE_USER"];

const ROLE_LABELS = {
  ROLE_USER: "Utente",
  ROLE_STAFF: "Staff",
  ROLE_ADMIN: "Admin",
};

const ROLE_COLORS = {
  ROLE_USER: "", // Neutro (nessuna classe)
  ROLE_STAFF: "badge-confermata", // Blu
  ROLE_ADMIN: "badge-attivo", // Verde acqua
};

// Lucchetto admin
const LockIconSmall = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="var(--gray-500)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: "4px", verticalAlign: "middle" }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="var(--gray-500)" />
  </svg>
);

const AdminRoleManagement = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draftRoles, setDraftRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isAdmin = useMemo(() => user?.roles?.includes("ROLE_ADMIN"), [user]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const isSelf = selectedUser?.id === user?.id;
  
  useEffect(() => {
    if (!isAdmin) return;
    
    const loadUsers = async () => {
      setLoading(true);
      setMessage(null);
      
      try {
        const getAuthHeaders = () => {
          if (!token) {
            return { "Content-Type": "application/json" };
          }
          return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };
        };
        
        const apiUrl = "/api/admin/users";
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        
        if (!response.ok) {
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

  const handleSaveClick = () => {
    if (!selectedUser) return;
    if (draftRoles.length === 0) {
      setMessage({ type: "error", text: "L'utente deve avere almeno un ruolo." });
      return;
    }
    setShowModal(true);
  };

  const saveRoles = async () => {
    setSaving(true);
    setMessage(null);
    setShowModal(false);

    try {
      const getAuthHeaders = () => {
        if (!token) {
          return { "Content-Type": "application/json" };
        }
        return {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
      };

      const apiUrl = `/api/admin/users/${selectedUser.username}/roles`;
      const response = await fetch(apiUrl, {
        method: "PATCH",
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
      setMessage({ type: "success", text: data.message || "Ruoli aggiornati con successo!" });
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
      <div className="page-container">
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <h3 style={{ color: "var(--gray-700)" }}>Accesso Negato</h3>
            <p className="text-muted">Non hai i permessi per accedere a questa pagina.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-wrapper">
          <div className="loading-spinner-custom"></div>
          <span>Caricamento utenti...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Pannello Amministratore</h2>
          <p className="page-subtitle">Gestisci i ruoli degli utenti del sistema</p>
        </div>
      </div>

      {message && (
        <div
          className={message.type === "error" ? "form-error" : "form-success"}
          style={{ marginBottom: "var(--space-4)" }}
        >
          {message.text}
        </div>
      )}

      {users.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <h3 style={{ color: "var(--gray-700)" }}>Nessun utente trovato</h3>
            <p className="text-muted">Non ci sono utenti registrati nel sistema.</p>
          </div>
        </div>
      ) : (
        <div className="admin-grid">
          {/* Colonna sinistra - Lista utenti */}
          <div className="card">
            <div className="card-header">
              <h3>Utenti</h3>
              <span
                className="badge badge-info"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}
              >
                {users.length}
              </span>
            </div>
            <div className="card-body admin-user-list">
              {users.map((u) => {
                const isAdminUser = u.roles?.includes("ROLE_ADMIN");

                // Ordina i ruoli: Admin prima, poi Staff, poi Utente
                {
                  (u.roles || []).map((role) => {
                    const colorClass = ROLE_COLORS[role] || "";
                    return (
                      <span key={role} className={`badge-status ${colorClass}`}>
                        {ROLE_LABELS[role] || role}
                      </span>
                    );
                  })
                }

                return (
                  <div
                    key={u.id}
                    className={`admin-user-item ${u.id === selectedUserId ? "active" : ""}`}
                    onClick={() => setSelectedUserId(u.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedUserId(u.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="admin-user-info">
                      <div className="admin-user-name">
                        {u.username}
                        {isAdminUser && <LockIconSmall />}
                      </div>
                      <div className="admin-user-email">{u.email}</div>
                    </div>
                    <div className="admin-user-roles">
                      {(u.roles || []).map((role) => {
                        const colorClass = ROLE_COLORS[role] || "";
                        return (
                          <span key={role} className={`badge-status ${colorClass}`}>
                            {ROLE_LABELS[role] || role}
                          </span>
                        );
                      })}
                      {(!u.roles || u.roles.length === 0) && (
                        <span className="badge-status badge-sconosciuto">Nessun ruolo</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonna destra - Modifica ruoli */}
          <div className="card">
            <div className="card-header">
              <h3>Modifica Ruoli</h3>
            </div>
            <div className="card-body">
              {selectedUser ? (
                <>
                  <p className="admin-selected-user">
                    Modifica i ruoli per <strong>{selectedUser.username}</strong>
                    {isSelf && (
                      <span className="badge-status badge-sconosciuto" style={{ marginLeft: 8 }}>
                        (tu)
                      </span>
                    )}
                  </p>

                  {isSelf && (
                    <div className="form-error" style={{ marginBottom: "var(--space-4)" }}>
                      Non puoi modificare i tuoi stessi ruoli.
                    </div>
                  )}

                  <div className="admin-roles-list">
                    {AVAILABLE_ROLES.map((role) => {
                      const colorClass = ROLE_COLORS[role] || "";
                      return (
                        <label
                          key={role}
                          className={`admin-role-checkbox ${draftRoles.includes(role) ? "checked" : ""} ${isSelf ? "disabled" : ""
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={draftRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                            disabled={isSelf}
                          />
                          <span className="admin-role-label">{ROLE_LABELS[role] || role}</span>
                          <span className={`badge-status ${colorClass}`}>
                            {role.replace("ROLE_", "")}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="admin-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveClick}
                      disabled={saving || isSelf}
                    >
                      {saving ? "Salvataggio..." : "Salva Ruoli"}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        if (selectedUser) setDraftRoles(selectedUser.roles || []);
                        setMessage(null);
                      }}
                    >
                      Annulla
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-muted admin-no-selection">
                  Seleziona un utente per modificarne i ruoli.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* MODALE DI CONFERMA */}
      {/* ======================================== */}
      {showModal && (
        <div className="visite-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="visite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="visite-modal-header">
              <h3>Conferma Modifica</h3>
            </div>
            <div className="visite-modal-body">
              <p>
                Stai per modificare i ruoli di <strong>{selectedUser?.username}</strong>.
              </p>
              <p>Confermi di voler procedere con le modifiche?</p>
            </div>
            <div className="visite-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Annulla
              </button>
              <button className="btn btn-primary" onClick={saveRoles} disabled={saving}>
                {saving ? "Salvataggio..." : "Conferma"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoleManagement;