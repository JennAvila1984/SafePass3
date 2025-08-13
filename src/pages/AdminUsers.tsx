// src/components/admin/AddUserForm.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.string().min(2, "Role is required"),
});
type AddUserFormValues = z.infer<typeof schema>;

type Props = {
  onSuccess?: () => void;
  defaultValues?: Partial<AddUserFormValues>;
  userId?: string; // if present => update
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function AddUserForm({ onSuccess, defaultValues, userId }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<AddUserFormValues>({
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
      if (error) { alert(error.message); return; }
    } else {
      const { error } = await supabase.from("users").insert({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone ?? null,
        role: values.role,
      });
      if (error) { alert(error.message); return; }
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input id="role" placeholder="admin | staff | monitor" {...register("role")} />
        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {userId ? "Update User" : "Add User"}
      </Button>
    </form>
  );
}







