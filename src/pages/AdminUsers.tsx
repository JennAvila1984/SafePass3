import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      alert("Failed to fetch users: " + error.message);
    } else {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or update user
  const handleSubmit = async () => {
    if (editingUserId) {
      const { error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", editingUserId);

      if (error) {
        alert("Error updating user: " + error.message);
      } else {
        alert("User updated!");
      }
    } else {
      const { error } = await supabase.from("users").insert([formData]);
      if (error) {
        alert("Error adding user: " + error.message);
      } else {
        alert("User added!");
      }
    }

    setFormData({ full_name: "", email: "", role: "", phone: "" });
    setEditingUserId(null);
    fetchUsers();
  };

  // Edit user
  const handleEdit = (user: User) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
    setEditingUserId(user.id);
  };

  // Delete user
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      alert("User deleted!");
      fetchUsers();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Add/Edit User Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          {editingUserId ? "Edit User" : "Add New User"}
        </h2>
        <div className="flex flex-col gap-3 max-w-md">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {editingUserId ? "Update User" : "Add User"}
          </button>
        </div>
      </div>

      {/* User List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{user.full_name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border">{user.phone}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;


