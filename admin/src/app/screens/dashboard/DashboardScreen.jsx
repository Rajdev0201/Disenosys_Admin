"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Layers,
  ListChecks,
  School,
  UserPlus,
  Users,
} from "lucide-react";
import { API } from "@/components/utils/Constant";
import { courseApi } from "@/components/utils/courseApi";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className="shrink-0 h-12 w-12 rounded-2xl bg-sky-50 grid place-items-center">
        <Icon className="h-6 w-6 text-indigo-700" />
      </div>
    </div>
  );
}

function getDateFromRow(row) {
  const candidate =
    row?.createdAt ||
    row?.created_at ||
    row?.date ||
    row?.paymentDate ||
    row?.payment_date ||
    row?.updatedAt ||
    row?.updated_at;
  const d = candidate ? new Date(candidate) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return d;
}

function groupByMonth(rows, year) {
  const out = new Array(12).fill(0);
  for (const row of rows) {
    const d = getDateFromRow(row);
    if (!d) continue;
    if (d.getFullYear() !== year) continue;
    out[d.getMonth()] += 1;
  }
  return out;
}

function BarChart({ online, offline }) {
  const max = Math.max(1, ...online, ...offline);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-500" />
          Online pay
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />
          Offline pay
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-2 items-end h-48">
        {MONTHS.map((m, idx) => {
          const onlineVal = online[idx] || 0;
          const offlineVal = offline[idx] || 0;
          const onlineH = `${(onlineVal / max) * 100}%`;
          const offlineH = `${(offlineVal / max) * 100}%`;
          return (
            <div key={m} className="flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-36">
                <div
                  title={`Online: ${onlineVal}`}
                  className="w-2.5 rounded-md bg-sky-500/90"
                  style={{ height: onlineH }}
                />
                <div
                  title={`Offline: ${offlineVal}`}
                  className="w-2.5 rounded-md bg-indigo-500/90"
                  style={{ height: offlineH }}
                />
              </div>
              <span className="text-[11px] text-slate-500">{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.message || `Request failed (HTTP ${res.status}).`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function pickRows(json) {
  if (Array.isArray(json)) return json;
  const keys = ["data", "DataList", "result", "results", "list"];
  for (const key of keys) {
    const v = json?.[key];
    if (Array.isArray(v)) return v;
  }
  return [];
}

export default function DashboardScreen() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [onlineRows, setOnlineRows] = useState([]);
  const [offlineRows, setOfflineRows] = useState([]);
  const [courseCount, setCourseCount] = useState(null);
  console.log({ onlineRows, offlineRows,courseCount });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const [onlineRes, offlineRes, coursesRes] = await Promise.allSettled([
          fetchJson("paymentDetails?page=1&limit=1000"),
          fetchJson("offline-payments?page=1&limit=1000"),
          courseApi.list(),
        ]);

        if (!mounted) return;

        if (onlineRes.status === "fulfilled") {
          setOnlineRows(pickRows(onlineRes.value));
        } else {
          setOnlineRows([]);
        }

        if (offlineRes.status === "fulfilled") {
          setOfflineRows(pickRows(offlineRes.value));
        } else {
          setOfflineRows([]);
        }

        if (coursesRes.status === "fulfilled") {
          const courses = coursesRes.value;
          setCourseCount(Array.isArray(courses) ? courses.length : 0);
        } else {
          setCourseCount(0);
        }

        const parts = [];
        if (onlineRes.status === "rejected") parts.push("Online payments");
        if (offlineRes.status === "rejected") parts.push("Offline payments");
        if (coursesRes.status === "rejected") parts.push("Courses");
        if (parts.length) {
          setError(`${parts.join(", ")} failed to load.`);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load dashboard data.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onlineByMonth = useMemo(() => groupByMonth(onlineRows, year), [onlineRows, year]);
  const offlineByMonth = useMemo(() => groupByMonth(offlineRows, year), [offlineRows, year]);

  const totalOnline = onlineRows.length;
  const totalOffline = offlineRows.length;
  const totalStudentsJoined = totalOnline + totalOffline;

  return (
    <section className="px-6 xl:px-12 py-8 font-dm-sans">
      <header className="space-y-1">
        <h1 className="text-primary font-medium text-2xl">Dashboard</h1>
        <p className="text-gray-400 text-sm">Hi, Welcome to Disenosys Admin Dashboard</p>
      </header>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Interns" value={loading ? "..." : totalOnline} icon={Users} />
        <StatCard title="Total Exams" value={loading ? "..." : totalOffline} icon={FileText} />
        <StatCard title="Total Courses" value={loading ? "..." : courseCount ?? 0} icon={BookOpen} />
        <StatCard title="GPDX" value={loading ? "..." : 0} icon={Layers} />
        <StatCard title="University List" value={loading ? "..." : 0} icon={School} />
        <StatCard title="External List" value={loading ? "..." : 0} icon={ListChecks} />
        <StatCard title="Company List" value={loading ? "..." : 0} icon={BriefcaseBusiness} />
        <StatCard title="Students Joined" value={loading ? "..." : totalStudentsJoined} icon={UserPlus} />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Payments overview</h2>
            <p className="text-sm text-slate-500">Online and offline payments per month.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <BarChart online={onlineByMonth} offline={offlineByMonth} />
      </div>
    </section>
  );
}
