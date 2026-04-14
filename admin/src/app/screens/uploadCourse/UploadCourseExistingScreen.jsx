"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ModeTabs from "@/app/screens/uploadCourse/components/ModeTabs";
import CourseBasicsForm from "@/app/screens/uploadCourse/components/CourseBasicsForm";
import CurriculumEditor from "@/app/screens/uploadCourse/components/CurriculumEditor";
import QuizEditor from "@/app/screens/uploadCourse/components/QuizEditor";
import { courseApi } from "@/components/utils/courseApi";
import Table from "@/components/custom/Table";
import Input from "@/components/custom/Input";

function getCourseId(course) {
  return (
    course?._id ||
    course?.id ||
    course?.courseId ||
    course?.course_id ||
    course?.courseID ||
    null
  );
}

export default function UploadCourseExistingScreen() {
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [course, setCourse] = useState(null);
  const [originalPayload, setOriginalPayload] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      String(c?.courseName || c?.name || "").toLowerCase().includes(q),
    );
  }, [list, query]);

  const tableData = useMemo(() => {
    return filtered.map((c) => {
      const id = getCourseId(c);
      const name = c?.courseName || c?.name || "Untitled";
      const category = Array.isArray(c?.category)
        ? c.category.join(", ")
        : String(c?.category || "");
      return {
        id,
        name,
        category,
        duration: c?.duration || "",
        raw: c,
      };
    });
  }, [filtered]);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError("");
    try {
      const courses = await courseApi.list();
      setList(courses);
      if (!selectedId && Array.isArray(courses) && courses.length > 0) {
        const firstId = getCourseId(courses[0]);
        if (firstId) setSelectedId(firstId);
      }
    } catch (err) {
      setError(err?.message || "Failed to load courses.");
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadCourse = useCallback(async (id) => {
    if (!id) return;
    setLoadingCourse(true);
    setError("");
    setSuccess("");
    try {
      const data = await courseApi.getById(id);
      const nextCourse = {
        ...data,
        curriculum: Array.isArray(data?.curriculum) ? data.curriculum : [],
        questions: Array.isArray(data?.questions) ? data.questions : [],
      };
      setCourse(nextCourse);
      setOriginalPayload(JSON.stringify(courseApi.toPayload(nextCourse)));
    } catch (err) {
      setError(err?.message || "Failed to load course.");
    } finally {
      setLoadingCourse(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadCourse(selectedId);
  }, [selectedId, loadCourse]);

  const canSave = useMemo(() => {
    return !!selectedId && String(course?.courseName || "").trim().length > 0;
  }, [course?.courseName, selectedId]);

  const isDirty = useMemo(() => {
    if (!course) return false;
    const current = JSON.stringify(courseApi.toPayload(course));
    return !!originalPayload && current !== originalPayload;
  }, [course, originalPayload]);

  const onSelectCourse = (id) => {
    if (!id || id === selectedId) return;
    if (saving || loadingCourse) return;
    if (deletingId) return;
    if (isDirty) {
      const ok = window.confirm(
        "You have unsaved changes. Discard them and switch courses?",
      );
      if (!ok) return;
    }
    setSelectedId(id);
  };

  const onDeleteCourse = async (id) => {
    if (!id) return;
    if (saving || loadingCourse) return;
    if (isDirty && id === selectedId) {
      const ok = window.confirm(
        "You have unsaved changes on this course. Delete anyway?",
      );
      if (!ok) return;
    } else {
      const ok = window.confirm("Delete this course?");
      if (!ok) return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);
    try {
      await courseApi.remove(id);
      setSuccess("Course deleted.");
      if (id === selectedId) {
        setSelectedId(null);
        setCourse(null);
        setOriginalPayload("");
      }
      await loadList();
    } catch (err) {
      setError(err?.message || "Failed to delete course.");
    } finally {
      setDeletingId(null);
    }
  };

  const onSave = async () => {
    setError("");
    setSuccess("");
    if (!canSave) return;

    setSaving(true);
    try {
      await courseApi.update(selectedId, course);
      setSuccess("Course updated successfully.");
      setOriginalPayload(JSON.stringify(courseApi.toPayload(course)));
      await loadList();
    } catch (err) {
      setError(err?.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="px-6 xl:px-12 py-8 font-dm-sans">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-primary font-medium text-2xl">Upload course</h1>
          <p className="text-gray-500 text-sm">
            Select a course and update all details, curriculum and quiz.
          </p>
        </div>
        <ModeTabs />
      </header>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-1 gap-6">
        <aside className="xl:col-span-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Courses</h2>
              <button
                type="button"
                onClick={loadList}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                disabled={loadingList}
              >
                {loadingList ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="mt-3">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
              />
            </div>

            <div className="mt-4 max-h-[60vh] overflow-auto pr-1">
              {loadingList ? (
                <div className="text-sm text-slate-500 p-2">Loading courses...</div>
              ) : tableData.length === 0 ? (
                <div className="text-sm text-slate-500 p-2">No courses found.</div>
              ) : (
                <Table
                  columns={[
                    { header: "Course", accessor: "name" },
                    // { header: "Category", accessor: "category" },
                    // { header: "Duration", accessor: "duration" },
                    {
                      header: "Action",
                      accessor: "id",
                      render: (value, row) => {
                        const active = value && value === selectedId;
                        const deleting = deletingId === value;
                        return (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => value && onSelectCourse(value)}
                              disabled={!value || deleting}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                                active
                                  ? "border-primary bg-primary text-white"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              {active ? "Editing" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() => value && onDeleteCourse(value)}
                              disabled={!value || deleting}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        );
                      },
                    },
                  ]}
                  data={tableData}
                />
              )}
            </div>
          </div>
        </aside>

        <div className="xl:col-span-12 space-y-6">
          {!selectedId ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Select a course to edit.
            </div>
          ) : loadingCourse || !course ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Loading course details...
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Editing</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {course?.courseName || course?.name || "Untitled"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isDirty ? (
                    <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-semibold">
                      Unsaved changes
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-semibold">
                      Saved
                    </span>
                  )}
                </div>
              </div>
              <CourseBasicsForm value={course} onChange={setCourse} />
              <CurriculumEditor
                value={course.curriculum}
                onChange={(curriculum) => setCourse((p) => ({ ...p, curriculum }))}
              />
              <QuizEditor
                value={course.questions}
                onChange={(questions) => setCourse((p) => ({ ...p, questions }))}
              />
            </>
          )}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <div className="sticky bottom-4 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => selectedId && loadCourse(selectedId)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              disabled={!selectedId || saving || loadingCourse || !isDirty}
            >
              Discard & reload
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-[#0b0f46] disabled:opacity-60"
              disabled={!canSave || saving || loadingCourse || !isDirty}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
