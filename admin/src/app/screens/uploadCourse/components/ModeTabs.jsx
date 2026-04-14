"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ModeTabs() {
  const pathname = usePathname();
  const items = [
    { label: "New course add", href: "/admin/upload-course/new" },
    { label: "Existing course edit", href: "/admin/upload-course/existing" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition ${
              active
                ? "bg-primary text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

