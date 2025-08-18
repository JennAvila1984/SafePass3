// src/pages/AdminUsers.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";

// shadcn/ui components (adjust paths if your setup differs)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ==============================
// Inline Add User / Edit User Form
// ==============================
const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.string().min(2, "Role is required"),
});
type AddUserFormValues = z.infer<typeof schema>;

type LocalAddUserFormProps = {
  onSuccess?: () => void;
  defaultValues?: Partial<AddUserFormValues>;
  userId?: string; // if present => update
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

function LocalAddUserForm({ onSuccess, defaultValues, userId }: LocalAddUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: "staff",
      ...defaultValues,
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    if (userId) {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone ?? null,
          role: values.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("users").insert({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone ?? null,
        role: values.role,
      });
      if (error) {
        alert(error.message);
        return;
      }
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && (
          <p className="text-red-500 text-sm">{errors.full_name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input id="role" placeholder="admin | staff | monitor" {...register("role")} />
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {userId ? "Update User" : "Add User"}
      </Button>
    </form>
  );
}

// ==============================
// Admin Users Page
// ==============================
type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function AdminUsers() {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserRow | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
            </DialogHeader>
            <LocalAddUserForm
              key={editing?.id ?? "create"}
              userId={editing?.id}
              defaultValues={
                editing
                  ? {
                      full_name: editing.full_name,
                      email: editing.email,
                      phone: editing.phone ?? "",
                      role: editing.role,
                    }
                  : undefined
              }
              onSuccess={() => { setOpen(false); setEditing(null); load(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={5}>Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={5}>No users yet.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone ?? "-"}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditing(u); setOpen(true); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!confirm("Delete this user?")) return;
                        const { error } = await supabase
                          .from("users")
                          .delete()
                          .eq("id", u.id);
                        if (error) { alert(error.message); return; }
                        load();
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}









