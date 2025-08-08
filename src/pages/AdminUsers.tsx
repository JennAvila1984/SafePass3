import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type UserProfile = {
  id: string;         // we’ll set this = user_id
  user_id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: "admin" | "teacher" | "bus_driver" | "school_monitor" | "nurse" | null;
  school_id: string | null;
  bus_id: string | null;
  status: "pending" | "approved" | "suspended" | null;
  created_at?: string;
  updated_at?: string;
};

const emptyForm: Partial<UserProfile> = {
  user_id: "",
  email: "",
  name: "",
  phone: "",
  role: "teacher",
  school_id: "",
  bus_id: "",
  status: "approved",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // add/edit form
  const [form, setForm] = useState<Partial<UserProfile>>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id,user_id,email,name,phone,role,school_id,bus_id,status,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setUsers((data || []) as UserProfile[]);
    setLoading(false);
  }

  async function addUser(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setErr(null);

    // require a real Auth UID for login-linking
    if (!form.user_id) {
      setErr("Please paste the user’s Supabase Auth UID (from Auth → Users).");
      setSaving(false);
      return;
    }

    const row = {
      id: form.user_id, // keep id == user_id for simplicity
      user_id: form.user_id!,
      email: form.email || null,
      name: form.name || null,
      phone: form.phone || null,
      role: form.role || "teacher",
      school_id: form.school_id || null,
      bus_id: form.bus_id || null,
      status: form.status || "approved",
    };

    const { error } = await supabase.from("user_profiles").insert(row);
    if (error) setErr(error.message);
    else {
      setForm(emptyForm);
      await refresh();
    }
    setSaving(false);
  }

  async function updateUser(id: string, changes: Partial<UserProfile>) {
    setErr(null);
    const { error } = await supabase.from("user_profiles").update(changes).eq("id", id);
    if (error) setErr(error.message);
    else await refresh();
  }

  async function deleteUser(id: string) {
    setErr(null);
    const yes = confirm("Delete this profile?");
    if (!yes) return;
    const { error } = await supabase.from("user_profiles").delete().eq("id", id);
    if (error) setErr(error.message);
    else await refresh();
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>User Management</h1>

      {/* error */}
      {err && (
        <div style={{ background: "#ffe6e6", color: "#b00020", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* Add user (links to an existing Supabase Auth user) */}
      <form onSubmit={addUser} style={{ display: "grid", gap: 8, marginBottom: 16, border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 600 }}>Add User (paste Auth UID)</div>
        <input placeholder="Auth UID (from Supabase → Auth → Users)" value={form.user_id || ""} onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
        <input placeholder="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <select value={form.role || "teacher"} onChange={(e) => setForm({ ...form, role: e.target.value as UserProfile["role"] })}>
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
            <option value="bus_driver">bus_driver</option>
            <option value="school_monitor">school_monitor</option>
            <option value="nurse">nurse</option>
          </select>
          <input placeholder="School ID (e.g., central-high)" value={form.school_id || ""} onChange={(e) => setForm({ ...form, school_id: e.target.value })} />
          <input placeholder="Bus ID (e.g., bus-01)" value={form.bus_id || ""} onChange={(e) => setForm({ ...form, bus_id: e.target.value })} />
        </div>
        <select value={form.status || "approved"} onChange={(e) => setForm({ ...form, status: e.target.value as UserProfile["status"] })}>
          <option value="approved">approved</option>
          <option value="pending">pending</option>
          <option value="suspended">suspended</option>
        </select>

        <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
          {saving ? "Saving..." : "Add User"}
        </button>
      </form>

      {/* Users table */}
      {loading ? (
        <div>Loading users…</div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f7f7f7" }}>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Status</th>
                <th style={th}>School</th>
                <th style={th}>Bus</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={td}>{u.name || "—"}</td>
                  <td style={td}>{u.email || "—"}</td>
                  <td style={td}>
                    <select value={u.role || ""} onChange={(e) => updateUser(u.id, { role: e.target.value as UserProfile["role"] })}>
                      <option value="admin">admin</option>
                      <option value="teacher">teacher</option>
                      <option value="bus_driver">bus_driver</option>
                      <option value="school_monitor">school_monitor</option>
                      <option value="nurse">nurse</option>
                    </select>
                  </td>
                  <td style={td}>
                    <select value={u.status || ""} onChange={(e) => updateUser(u.id, { status: e.target.value as UserProfile["status"] })}>
                      <option value="approved">approved</option>
                      <option value="pending">pending</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </td>
                  <td style={td}>{u.school_id || "—"}</td>
                  <td style={td}>{u.bus_id || "—"}</td>
                  <td style={td}>
                    <button onClick={() => deleteUser(u.id)} style={{ color: "#b00020" }}>Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td style={td} colSpan={7}>No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: 10, borderBottom: "1px solid #eee", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: 10, borderBottom: "1px solid #eee", verticalAlign: "top" };

