"use client";

import { useMemo } from "react";

function createEmptyItem() {
  return {
    title: "",
    titles: "",
    subTopic: "",
    subTopics: "",
    subLinks: "",
  };
}

export default function CurriculumEditor({ value, onChange }) {
  const items = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const stats = useMemo(() => {
    const count = items.length;
    const filled = items.filter((x) =>
      String(x?.titles || x?.title || "").trim(),
    ).length;
    return { count, filled };
  }, [items]);

  const updateItem = (index, patch) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange(next);
  };

  const addItem = () => onChange([...items, createEmptyItem()]);

  const removeItem = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Curriculum</h2>
          <p className="text-sm text-slate-500">
            Add titles, subTopic, subTopics and subLinks per lesson.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {stats.filled}/{stats.count} filled
          </span>
          <button
            type="button"
            onClick={addItem}
            className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90 transition"
          >
            + Add lesson
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            No curriculum yet. Click &ldquo;Add lesson&rdquo; to start.
          </div>
        ) : null}

        {items.map((item, index) => (
          <div
            key={item?._id || `${index}`}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  Lesson {index + 1}
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {String(item?.titles || item?.title || "").trim() || "Untitled"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  titles (pre-record section page)
                </label>
                <input
                  value={item?.titles || ""}
                  onChange={(e) => updateItem(index, { titles: e.target.value })}
                  placeholder="Surface Remastering - 01"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  title (description page)
                </label>
                <input
                  value={item?.title || ""}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  placeholder="Tim Mounting Bracket - L Shape"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  subTopic (pre-record section page)
                </label>
                <input
                  value={item?.subTopic || ""}
                  onChange={(e) => updateItem(index, { subTopic: e.target.value })}
                  placeholder="Introduction, Top Surface Development, ..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  subTopics (description page)
                </label>
                <textarea
                  value={item?.subTopics || ""}
                  onChange={(e) => updateItem(index, { subTopics: e.target.value })}
                  placeholder="Abstract and Introduction to the Project..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary resize-y"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  subLinks
                </label>
                <input
                  value={item?.subLinks || ""}
                  onChange={(e) => updateItem(index, { subLinks: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
