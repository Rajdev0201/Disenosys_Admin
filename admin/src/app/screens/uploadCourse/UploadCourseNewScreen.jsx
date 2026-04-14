"use client";

import { useMemo, useState } from "react";
import ModeTabs from "@/app/screens/uploadCourse/components/ModeTabs";
import CourseBasicsForm from "@/app/screens/uploadCourse/components/CourseBasicsForm";
import CurriculumEditor from "@/app/screens/uploadCourse/components/CurriculumEditor";
import QuizEditor from "@/app/screens/uploadCourse/components/QuizEditor";
import { courseApi } from "@/components/utils/courseApi";

function createEmptyCourse() {
  return {
    courseName: "",
    description: "",
    category: [],
    duration: "",
    imagePath: "",
    video_url: "",
    live: "",
    record: "",
    noOfLessons: "",
    detailsDescription: "",
    curriculum: [],
    questions: [],
  };
}

export default function UploadCourseNewScreen() {
  const [course, setCourse] = useState(createEmptyCourse());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSave = useMemo(() => {
    return String(course.courseName || "").trim().length > 0;
  }, [course.courseName]);

  const onSave = async () => {
    setError("");
    setSuccess("");
    if (!canSave) return;

    setSaving(true);
    try {
      await courseApi.create(course);
      setSuccess("Course created successfully.");
      setCourse(createEmptyCourse());
    } catch (err) {
      setError(err?.message || "Failed to create course.");
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
            Create a new course, add curriculum and quiz.
          </p>
        </div>
        <ModeTabs />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <CourseBasicsForm value={course} onChange={setCourse} />

        <CurriculumEditor
          value={course.curriculum}
          onChange={(curriculum) => setCourse((p) => ({ ...p, curriculum }))}
        />

        <QuizEditor
          value={course.questions}
          onChange={(questions) => setCourse((p) => ({ ...p, questions }))}
        />

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
            onClick={() => setCourse(createEmptyCourse())}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            disabled={saving}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-[#0b0f46] disabled:opacity-60"
            disabled={!canSave || saving}
          >
            {saving ? "Saving..." : "Create course"}
          </button>
        </div>
      </div>
    </section>
  );
}
