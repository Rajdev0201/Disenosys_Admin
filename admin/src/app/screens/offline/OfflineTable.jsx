"use client";

import Input from "@/components/custom/Input";
import Pagination from "@/components/custom/Pagination";
import Table from "@/components/custom/Table";
import { API } from "@/components/utils/Constant";
import { courseApi } from "@/components/utils/courseApi";
import React, { useCallback, useEffect, useState } from "react";

const OfflineTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    courseName: "",
    fees: "",
  });

  const columns = [
    // { header: "SectionID", accessor: "sectionId" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Course", accessor: "courseName" },
    { header: "Fees", accessor: "fees" },
    {
  header: "Status",
  accessor: "isActive",
  render: (isActive, row) => (
    <button
      type="button"
      className={`relative inline-flex items-center h-6 w-11 rounded-full ${
        isActive ? "bg-green-500" : "bg-red-500"
      }`}
      onClick={() => handleToggle(row?._id, isActive)}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          isActive ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  ),
}

  ];

  const fetchResults = useCallback(async () => {
     setLoading(true);
     const res = await fetch(
       `${API}offline-payments?page=${page}&limit=10&search=${search}`,
     );
 
     const json = await res.json();
     setData(json?.DataList);
     setTotalPages(json?.pagination?.totalPages);
     setLoading(false);
   }, [page, search]);
   
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const courses = await courseApi.list();
        if (!isMounted) return;

        const names = Array.from(
          new Set(
            (Array.isArray(courses) ? courses : [])
              .map((course) => String(course?.courseName || course?.name || "").trim())
              .filter(Boolean),
          ),
        );

        setCourseOptions(names);
      } catch (err) {
        if (isMounted) {
          console.log("Failed to load courses", err);
          setCourseOptions([]);
        }
      } finally {
        if (isMounted) setCoursesLoading(false);
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const Skeleton = () => (
    <div className="animate-pulse space-y-3 p-4 bg-white rounded-xl shadow">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-5 w-28 bg-gray-200 rounded"></div>
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
          <div className="h-5 w-28 bg-gray-200 rounded"></div>
          <div className="h-5 w-40 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
const handleToggle = (id, isActive) => {
  fetch(`${API}offline-active/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: !isActive }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        fetchResults();
      } else {
        alert("Failed to update status. Please try again.");
      }
    })
    .catch((err) => console.log(err));
};


  const closeAddModal = () => {
    setIsAddOpen(false);
    setAddError("");
    setIsSubmitting(false);
    setForm({ name: "", email: "", courseName: "", fees: "" });
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAddStudent = async (e) => {
    e.preventDefault();
    setAddError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const courseName = form.courseName.trim();
    const feesRaw = String(form.fees).trim();

    if (!name || !email || !courseName || !feesRaw) {
      setAddError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        email,
        courseName,
        fees: feesRaw,
        // Alternative keys (in case backend expects these)
        course: courseName,
        price: feesRaw,
      };

      const res = await fetch(`${API}add-offline-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Failed to add student (HTTP ${res.status}).`;
        try {
          const json = await res.json();
          message = json?.message || message;
        } catch {
          // ignore
        }
        setAddError(message);
        return;
      }

      closeAddModal();
      fetchResults();
    } catch (err) {
      setAddError(err?.message || "Failed to add student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-12 py-8 font-dm-sans">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-primary font-medium text-2xl">
            Offline Payments List
          </h1>
          <p className="text-gray-400 text-sm">
            Complete overview of all offline course payments and their status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0b0f46] transition"
        >
          Add-student
        </button>
      </header>

      <div className="mt-5">
        <Input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <Skeleton />
        ) : Array.isArray(data) && data.length > 0 ? (
          <Table columns={columns} data={data} />
        ) : (
          <div className="text-center py-10 text-gray-500">No data available</div>
        )}

        {data?.length > 0 ? (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      {isAddOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Offline Student
              </h2>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                X
              </button>
            </div>

            <form onSubmit={submitAddStudent} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Student name"
                  value={form.name}
                  onChange={onFormChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="student@email.com"
                  value={form.email}
                  onChange={onFormChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Course Name
                </label>
                <select
                  name="courseName"
                  value={form.courseName}
                  onChange={onFormChange}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={coursesLoading}
                >
                  <option value="">
                    {coursesLoading ? "Loading courses..." : "Select course"}
                  </option>
                  {courseOptions.map((courseName) => (
                    <option key={courseName} value={courseName}>
                      {courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fees</label>
                <Input
                  type="number"
                  name="fees"
                  placeholder="0"
                  value={form.fees}
                  onChange={onFormChange}
                />
              </div>

              {addError ? (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {addError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0b0f46] transition disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default OfflineTable;
