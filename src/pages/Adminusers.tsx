import { useEffect, useState } from "react";
// If this import errors, try: import { supabase } from "../lib/supabase";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  status: string | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("user_profiles").select(
        "id, email, name, role, status"
      );
      if (error) setError(error.message);
      else setUsers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading users…</div>;
  if (error) return <div style={{ padding: 16, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        User Management
      </h1>

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f6f6f6" }}>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={td}>{u.name || "—"}</td>
                <td style={td}>{u.email || "—"}</td>
                <td style={td}>{u.role || "—"}</td>
                <td style={td}>{u.status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: 10, borderBottom: "1px solid #eee" };
const td: React.CSSProperties = { padding: 10, borderBottom: "1px solid #eee" };
