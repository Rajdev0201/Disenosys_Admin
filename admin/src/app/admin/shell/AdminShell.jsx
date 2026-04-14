"use client";

import UserSideBar from "@/components/layouts/Sidebar";
import UserHeader from "@/components/layouts/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/components/utils/Constant";
import {
  clearAdminToken,
  getAdminAuthHeaders,
} from "@/components/utils/adminAuth";

function normalizeAdminProfile(json) {
  const candidate =
    json?.admin?.admin ||
    json?.admin ||
    json?.data?.admin?.admin ||
    json?.data?.admin ||
    json?.data ||
    json?.user ||
    json?.result;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  return candidate;
}

export default function AdminShell({ children }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const paths = ["admin/me", "admin/profile", "admin/getProfile"];
      let lastError = null;

      for (const path of paths) {
        try {
          const res = await fetch(`${API}${path}`, {
            method: "GET",
            headers: getAdminAuthHeaders({
              "Content-Type": "application/json",
            }),
            credentials: "include",
          });

          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              clearAdminToken();
              router.replace("/login");
              return;
            }
            if (res.status === 404) continue;
            throw new Error(`Failed to fetch admin info (HTTP ${res.status}).`);
          }

          const json = await res.json().catch(() => null);
          const normalized = normalizeAdminProfile(json);
          if (!normalized) throw new Error("Admin info not found in response.");
          setAdmin(normalized);
          return;
        } catch (e) {
          lastError = e;
        }
      }

      throw lastError || new Error("Failed to fetch admin info.");
    } catch {
      // If the backend is unreachable or response shape changes, fall back to login.
      clearAdminToken();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-slate-50 font-dm-sans">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
            Loading...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 h-screen">
          <div className="col-span-2 shadow-md h-full">
            <UserSideBar />
          </div>
          <div className="col-span-10 flex flex-col h-full overflow-y-auto relative">
            <UserHeader admin={admin || {}} />
            <div className="flex-1 overflow-y-auto bg-slate-50">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
