import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
  });

  // Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      alert("Error fetching users: " + error.message);
    } else {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add user to Supabase
  const handleAddUser = async () => {
    const { error } = await supabase.from("users").insert([formData]);
    if (error) {
      alert("Error adding user: " + error.message);
    } else {
      alert("User added!");
      setFormData({ full_name: "", email: "", role: "", phone: "" });
      fetchUsers();
    }
  };

  // Delete user by ID
  const handleDeleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      alert("User deleted.");
      fetchUsers();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Add User Form */}
      <div className="mb-6 border p-4 rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add New User</h2>
        <div className="flex flex-col gap-2 max-w-md">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add User
          </button>
        </div>
      </div>

      {/* User List Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">All Users</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Role</th>
                <th className="border px-3 py-2">Phone</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border px-3 py-2">{user.full_name}</td>
                  <td className="border px-3 py-2">{user.email}</td>
                  <td className="border px-3 py-2">{user.role}</td>
                  <td className="border px-3 py-2">{user.phone}</td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;




