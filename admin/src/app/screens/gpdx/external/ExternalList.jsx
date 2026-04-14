"use client";

import Input from "@/components/custom/Input";
import Pagination from "@/components/custom/Pagination";
import Table from "@/components/custom/Table";
import { gpdxApi } from "@/components/utils/gpdxApi";
import { Copy, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const MONTHS = [
  { label: "January", value: "Jan" },
  { label: "February", value: "Feb" },
  { label: "March", value: "Mar" },
  { label: "April", value: "Apr" },
  { label: "May", value: "May" },
  { label: "June", value: "Jun" },
  { label: "July", value: "Jul" },
  { label: "August", value: "Aug" },
  { label: "September", value: "Sep" },
  { label: "October", value: "Oct" },
  { label: "November", value: "Nov" },
  { label: "December", value: "Dec" },
];

function formatSno(index) {
  const n = Number(index) + 1;
  return String(n).padStart(2, "0");
}

function formatDate(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function pickText(row, keys, fallback = "-") {
  for (const key of keys) {
    const v = row?.[key];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return fallback;
}

function Select({ label, value, onChange, required, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-xl border shadow border-gray-300 px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      >
        {children}
      </select>
    </div>
  );
}

export default function ExternalList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log(rows)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }).map((_, idx) => String(current - idx));
  }, []);

  const closeModal = () => {
    setIsCreateOpen(false);
    setIsSubmitting(false);
    setFormError("");
    setMonth("");
    setYear("");
  };

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await gpdxApi.listExternal({ page, limit: 10, search });
      const list = gpdxApi.pickRows(json);
      const pag = gpdxApi.pickPagination(json);
      setRows(list);
      setTotalPages(pag.totalPages || 1);
    } catch (e) {
      setRows([]);
      setTotalPages(1);
      setError(e?.message || "Failed to load external list.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const submitGenerate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!month || !year) {
      setFormError("Month and year are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await gpdxApi.generateExternalCode({
        month,
        year,
        selectedMonth: month,
        selectedYear: year,
      });
      closeModal();
      fetchResults();
    } catch (err) {
      setFormError(err?.message || "Failed to generate code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (row) => {
    try {
      const id = row?._id || row?.id;
      if (!id) throw new Error("Id not found.");
      const next = !Boolean(row?.isActive);
      await gpdxApi.toggleExternal(id, next);
      fetchResults();
    } catch (e) {
      setError(e?.message || "Failed to update status.");
    }
  };

  const handleDelete = async (row) => {
    try {
      const id = row?._id || row?.id;
      if (!id) throw new Error("Id not found.");
      const ok = window.confirm("Delete this external code?");
      if (!ok) return;
      await gpdxApi.removeExternal(id);
      fetchResults();
    } catch (e) {
      setError(e?.message || "Failed to delete.");
    }
  };

  const copyCode = async (row) => {
    const code = pickText(row, ["code", "externalCode", "gpdxCode"], "");
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
  };

  const columns = useMemo(
    () => [
      {
        header: <input type="checkbox" aria-label="Select all" disabled />,
        accessor: "__select",
        render: () => <input type="checkbox" aria-label="Select row" />,
      },
      { header: "S.No", accessor: "__idx", render: (_v, _row, idx) => formatSno(idx) },
      {
        header: "Code",
        accessor: "code",
        render: (_v, row) => pickText(row, ["code", "externalCode", "gpdxCode"], "-"),
      },
      {
        header: "Created Date",
        accessor: "createdAt",
        render: (_v, row) =>
          formatDate(pickText(row, ["createdAt", "created_at", "date"], "")),
      },
       {
        header: "Expires Date",
        accessor: "expiresAt",
        render: (_v, row) =>
          formatDate(pickText(row, ["expiresAt", "expires_at", "expiryDate"], "")),
      },

      {
        header: "Actions",
        accessor: "__actions",
        render: (_v, row) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => copyCode(row)}
              className="text-slate-600 hover:text-indigo-700"
              aria-label="Copy code"
              title="Copy code"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row)}
              className="text-slate-600 hover:text-red-600"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
      {
        header: "Status",
        accessor: "isActive",
        render: (isActive, row) => (
          <button
            type="button"
            className={`relative inline-flex items-center h-6 w-11 rounded-full ${
              isActive ? "bg-green-500" : "bg-gray-300"
            }`}
            onClick={() => handleToggle(row)}
            aria-label="Toggle status"
            title="Toggle status"
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                isActive ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        ),
      },
    ],
    [],
  );

  const Skeleton = () => (
    <div className="animate-pulse space-y-3 p-4 bg-white rounded-xl shadow">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-5 w-10 bg-gray-200 rounded"></div>
          <div className="h-5 w-28 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="px-12 py-8 font-dm-sans">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-primary font-medium text-2xl">External List</h1>
          <p className="text-gray-400 text-sm">List of all external codes</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setIsCreateOpen(true);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0b0f46] transition"
        >
          + Create Code
        </button>
      </header>

      {error ? (
        <div className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-end">
        <div className="w-full max-w-xs">
          <Input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <Skeleton />
        ) : Array.isArray(rows) && rows.length > 0 ? (
          <Table columns={columns} data={rows} />
        ) : (
          <div className="text-center py-10 text-gray-500">No data available</div>
        )}

        {rows?.length > 0 ? (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        ) : null}
      </div>

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generate Code</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                X
              </button>
            </div>

            <form onSubmit={submitGenerate} className="mt-4 space-y-4">
              <Select
                label="Select Month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Select Year"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>

              {formError ? (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-10 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-10 py-2 text-sm font-medium text-white hover:bg-[#0b0f46] transition disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : "Generate Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
