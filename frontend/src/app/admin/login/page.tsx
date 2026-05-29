"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { GoldButton } from "@/components/ui/GoldButton";
import { FormField } from "@/components/forms/FormField";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const res = await api.post<{ access_token: string }>("/api/admin/auth/login", data);
      setToken(res.access_token);
      router.push("/admin/analytics");
    } catch (e: any) {
      setError(e.message || "Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-serif text-3xl text-text-primary mb-8 text-center">Admin Login</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField label="Email" type="email" placeholder="admin@example.com" error={errors.email?.message} {...register("email")} />
          <FormField label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
          {error && <p className="text-red-400 text-sm border border-red-500/40 p-3">{error}</p>}
          <GoldButton type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </GoldButton>
        </form>
      </div>
    </div>
  );
}
