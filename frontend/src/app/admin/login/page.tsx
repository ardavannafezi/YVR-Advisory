"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setToken } from "@/lib/auth";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${secs}s.`);
      return;
    }

    setError(null);
    try {
      const res = await api.post<{ access_token: string }>("/api/admin/auth/login", data);
      setToken(res.access_token);
      setAttempts(0);
      router.push("/admin");
    } catch (e: any) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError("Too many failed attempts. Locked for 60 seconds.");
      } else {
        setError("Invalid email or password.");
      }
    }
  }

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <p className="font-serif text-4xl text-text-primary tracking-wide mb-1">YVR Advisory</p>
          <div className="w-12 h-px bg-gold mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest text-text-dim">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate autoComplete="off">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-text-dim">Email</label>
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@yvradvisory.ca"
              {...register("email")}
              className="bg-white/[0.04] border border-white/10 text-text-primary placeholder:text-text-dim px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-text-dim">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className="bg-white/[0.04] border border-white/10 text-text-primary placeholder:text-text-dim px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <p className="text-red-400 text-sm border border-red-500/30 bg-red-500/5 px-4 py-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="mt-2 bg-gold text-background uppercase tracking-widest text-sm font-semibold py-3 hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Attempt indicator */}
        {attempts > 0 && attempts < MAX_ATTEMPTS && (
          <p className="text-center text-text-dim text-xs mt-4">
            {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>
    </div>
  );
}
