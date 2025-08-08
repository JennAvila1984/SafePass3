import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

const AdminUsers = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
    });

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage(`✅ User ${email} added!`);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Add New User</h1>
      <form onSubmit={handleAddUser} className="space-y-4">
        <div>
          <label>Email:</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add User
        </button>

        {message && <p className="mt-4">{message}</p>}
      </form>
    </div>
  );
};

export default AdminUsers;
