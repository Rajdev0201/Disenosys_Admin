"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/components/utils/Constant";
import {
  extractAdminToken,
  getStoredAdminToken,
  storeAdminToken,
} from "@/components/utils/adminAuth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ userEmail: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredAdminToken();
    if (token) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/admin/dashboard");
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    return form.userEmail.trim()?.length > 0 && form.password.trim().length > 0;
  }, [form.userEmail, form.password]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: form.userEmail?.trim(),
          password: form.password,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.message || `Login failed (HTTP ${res.status}).`);
        return;
      }

      const token = extractAdminToken(json);
      if (token) storeAdminToken(token);

      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      window.location.assign(next || "/admin/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center px-4 font-dm-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-500">
            Sign in to manage courses, curriculum and quizzes.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="userEmail"
              type="email"
              value={form.userEmail}
              onChange={onChange}
              placeholder="admin@company.com"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#45D2FF]"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#45D2FF]"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b0f46] disabled:opacity-60 disabled:hover:bg-primary transition"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
