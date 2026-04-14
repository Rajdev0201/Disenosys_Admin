"use client";

export default function CourseBasicsForm({ value, onChange }) {
  const course = value || {};

  const set = (patch) => onChange({ ...course, ...patch });

  const categoryString = Array.isArray(course.category)
    ? course.category.join(", ")
    : String(course.category || "");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-900">Course details</h2>
        <p className="text-sm text-slate-500">
          Basic information that appears on the course page.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-slate-600">Course name</label>
          <input
            value={course.courseName || ""}
            onChange={(e) => set({ courseName: e.target.value })}
            placeholder="Surface Remastering for Automotive Designers"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-slate-600">Description</label>
          <textarea
            value={course.description || ""}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Reverse engineering definition..."
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary resize-y"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Category</label>
          <input
            value={categoryString}
            onChange={(e) =>
              set({
                category: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Plastic Trims, CAD, ..."
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
          />
          <p className="mt-1 text-xs text-slate-400">Comma-separated</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Duration</label>
          <input
            value={course.duration || ""}
            onChange={(e) => set({ duration: e.target.value })}
            placeholder="3 Week"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Image URL</label>
            <input
              value={course.imagePath || ""}
              onChange={(e) => set({ imagePath: e.target.value })}
              placeholder="https://res.cloudinary.com/..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Video URL</label>
            <input
              value={course.video_url || ""}
              onChange={(e) => set({ video_url: e.target.value })}
              placeholder="https://www.youtube.com/embed/..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Live price</label>
          <input
            value={course.live || ""}
            onChange={(e) => set({ live: e.target.value })}
            placeholder="25,999"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Record price</label>
          <input
            value={course.record || ""}
            onChange={(e) => set({ record: e.target.value })}
            placeholder="9,999"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">No. of lessons</label>
          <input
            value={course.noOfLessons || ""}
            onChange={(e) => set({ noOfLessons: e.target.value })}
            placeholder="32"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-slate-600">Details (optional)</label>
          <textarea
            value={course.detailsDescription || ""}
            onChange={(e) => set({ detailsDescription: e.target.value })}
            placeholder="Any extra details..."
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary resize-y"
          />
        </div>
      </div>
    </div>
  );
}

