"use client";

import { useMemo } from "react";

function createEmptyQuestion() {
  return {
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };
}

export default function QuizEditor({ value, onChange }) {
  const questions = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const stats = useMemo(() => {
    const count = questions.length;
    const filled = questions.filter((q) => String(q?.question || "").trim()).length;
    return { count, filled };
  }, [questions]);

  const setQuestion = (index, patch) => {
    const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q));
    onChange(next);
  };

  const setOption = (qIndex, optIndex, nextValue) => {
    const q = questions[qIndex] || createEmptyQuestion();
    const options = Array.isArray(q.options) ? [...q.options] : ["", "", "", ""];
    options[optIndex] = nextValue;
    setQuestion(qIndex, { options });
  };

  const addQuestion = () => onChange([...questions, createEmptyQuestion()]);

  const removeQuestion = (index) => {
    const next = questions.filter((_, i) => i !== index);
    onChange(next);
  };

  const move = (from, to) => {
    if (to < 0 || to >= questions.length) return;
    const next = [...questions];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    onChange(next);
  };

  const normalizeCorrectIndex = (q) => {
    const options = Array.isArray(q?.options) ? q.options : [];
    const max = Math.max(0, options.length - 1);
    const idx = Number.isFinite(q?.correctIndex) ? q.correctIndex : 0;
    return Math.min(Math.max(0, idx), max);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Quiz</h2>
          <p className="text-sm text-slate-500">
            Add questions with options and a correct answer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {stats.filled}/{stats.count} filled
          </span>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90 transition"
          >
            + Add question
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            No questions yet. Click &ldquo;Add question&rdquo; to start.
          </div>
        ) : null}

        {questions.map((qRaw, qIndex) => {
          const q = qRaw || createEmptyQuestion();
          const options = Array.isArray(q.options) ? q.options : ["", "", "", ""];
          const correctIndex = normalizeCorrectIndex(q);
          return (
            <div
              key={q?._id || `${qIndex}`}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    Question {qIndex + 1}
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {String(q?.question || "").trim() || "Untitled question"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(qIndex, qIndex - 1)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(qIndex, qIndex + 1)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-600">
                  Question
                </label>
                <textarea
                  value={q.question || ""}
                  onChange={(e) => setQuestion(qIndex, { question: e.target.value })}
                  placeholder="Type the question..."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary resize-y"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {options.map((opt, optIndex) => {
                  const checked = optIndex === correctIndex;
                  return (
                    <div key={`${qIndex}-${optIndex}`} className="flex items-start gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={checked}
                        onChange={() => setQuestion(qIndex, { correctIndex: optIndex })}
                        className="mt-3"
                      />
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-600">
                          Option {optIndex + 1}
                        </label>
                        <input
                          value={opt || ""}
                          onChange={(e) => setOption(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
