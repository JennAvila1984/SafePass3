import { useState } from "react";
import { supabase } from "@/lib/supabase"; // adjust the path if needed

const AddUserForm = ({ onUserAdded }: { onUserAdded: () => void }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    if (!formData.full_name || !formData.email || !formData.role) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("users").insert([formData]);

    setLoading(false);

    if (error) {
      alert("Error adding user: " + error.message);
    } else {
      alert("User added!");
      setFormData({ full_name: "", email: "", role: "", phone: "" });
      onUserAdded(); // Refresh user list
    }
  };

  return (
    <div className="p-4 border rounded shadow max-w-md mb-6">
      <h2 className="text-lg font-semibold mb-2">Add New User</h2>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          name="role"
          placeholder="Role (e.g., ADMIN)"
          value={formData.role}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
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
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </div>
    </div>
  );
};

export default AddUserForm;

