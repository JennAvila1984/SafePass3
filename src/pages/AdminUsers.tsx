import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
  });

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (!error) setUsers(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    const { error } = await supabase.from("users").insert([formData]);
    if (error) {
      alert("Error adding user: " + error.message);
    } else {
      alert("User added!");
      setFormData({ full_name: "", email: "", role: "", phone: "" });
      fetchUsers(); // refresh list
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add New User</h2>
      <div className="flex flex-col gap-2 max-w-md mb-6">
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

      <h2 className="text-xl font-bold mb-4">User List</h2>
      <table className="table-auto w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.full_name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">{user.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;

