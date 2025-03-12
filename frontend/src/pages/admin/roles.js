import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { getCookie } from "cookies-next";
import Head from "next/head";

export default function ManageRoles() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const availablePermissions = [
    "read",
    "write",
    "delete",
    "manage_users",
    "manage_roles",
  ];

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin" && user.role !== "superadmin") {
        router.push("/dashboard");
      } else {
        fetchRoles();
      }
    }
  }, [user, loading, router]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoles(response.data.data);
      setFetchError(null);
    } catch (error) {
      setFetchError("Failed to load roles");
      console.error(error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const createRole = async (e) => {
    e.preventDefault();
    try {
      const token = getCookie("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles`,
        newRole,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionSuccess(`Role ${newRole.name} created successfully`);
      setTimeout(() => setActionSuccess(null), 3000);

      // Reset form
      setNewRole({
        name: "",
        description: "",
        permissions: [],
      });

      // Update the roles list
      fetchRoles();
    } catch (error) {
      setActionError(error.response?.data?.error || "Failed to create role");
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const updateRole = async (e) => {
    e.preventDefault();
    try {
      const token = getCookie("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles/${editingRole._id}`,
        editingRole,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionSuccess(`Role ${editingRole.name} updated successfully`);
      setTimeout(() => setActionSuccess(null), 3000);

      // Reset form
      setEditingRole(null);

      // Update the roles list
      fetchRoles();
    } catch (error) {
      setActionError(error.response?.data?.error || "Failed to update role");
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const deleteRole = async (roleId, roleName) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      const token = getCookie("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionSuccess(`Role ${roleName} deleted successfully`);
      setTimeout(() => setActionSuccess(null), 3000);

      // Update the roles list
      fetchRoles();
    } catch (error) {
      setActionError(error.response?.data?.error || "Failed to delete role");
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const handleNewRolePermissionChange = (permission) => {
    if (newRole.permissions.includes(permission)) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter((p) => p !== permission),
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, permission],
      });
    }
  };

  const handleEditingRolePermissionChange = (permission) => {
    if (editingRole.permissions.includes(permission)) {
      setEditingRole({
        ...editingRole,
        permissions: editingRole.permissions.filter((p) => p !== permission),
      });
    } else {
      setEditingRole({
        ...editingRole,
        permissions: [...editingRole.permissions, permission],
      });
    }
  };

  if (loading || !user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <Head>
        <title>Manage Roles - Secure Auth System</title>
      </Head>

      <nav className="navbar">
        <div className="brand">Secure Auth System</div>
        <div className="nav-links">
          <button onClick={() => router.push("/dashboard")}>Dashboard</button>
          <button onClick={() => router.push("/admin/users")}>
            Manage Users
          </button>
          <button onClick={() => router.push("/profile")}>My Profile</button>
        </div>
      </nav>

      <div className="container">
        <h1>Manage Roles</h1>

        {fetchError && <div className="alert alert-error">{fetchError}</div>}
        {actionError && <div className="alert alert-error">{actionError}</div>}
        {actionSuccess && (
          <div className="alert alert-success">{actionSuccess}</div>
        )}

        {/* Create New Role Form */}
        {!editingRole && (
          <div className="card mb-4">
            <h2>Create New Role</h2>
            <form onSubmit={createRole}>
              <div className="form-group">
                <label htmlFor="name">Role Name</label>
                <input
                  id="name"
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="permission-checkbox">
                      <input
                        type="checkbox"
                        id={`new-${permission}`}
                        checked={newRole.permissions.includes(permission)}
                        onChange={() =>
                          handleNewRolePermissionChange(permission)
                        }
                      />
                      <label htmlFor={`new-${permission}`}>{permission}</label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Role
              </button>
            </form>
          </div>
        )}

        {/* Edit Role Form */}
        {editingRole && (
          <div className="card mb-4">
            <h2>Edit Role: {editingRole.name}</h2>
            <form onSubmit={updateRole}>
              <div className="form-group">
                <label htmlFor="edit-name">Role Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingRole.name}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, name: e.target.value })
                  }
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editingRole.description}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      description: e.target.value,
                    })
                  }
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="permission-checkbox">
                      <input
                        type="checkbox"
                        id={`edit-${permission}`}
                        checked={editingRole.permissions.includes(permission)}
                        onChange={() =>
                          handleEditingRolePermissionChange(permission)
                        }
                      />
                      <label htmlFor={`edit-${permission}`}>{permission}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  Update Role
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingRole(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Roles List */}
        {loadingRoles ? (
          <div className="loading">Loading roles...</div>
        ) : (
          <div className="roles-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td>{role.name}</td>
                    <td>{role.description || "No description"}</td>
                    <td>
                      <div className="permissions-list">
                        {role.permissions && role.permissions.length > 0
                          ? role.permissions.map((p) => (
                              <span key={p} className="permission-tag">
                                {p}
                              </span>
                            ))
                          : "No permissions"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setEditingRole(role)}
                        >
                          Edit
                        </button>

                        {user.role === "superadmin" && (
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteRole(role._id, role.name)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
