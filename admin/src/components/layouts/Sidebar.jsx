"use client";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogOut,
  Pencil,
  PlusCircle,
  School,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assests/white-brand.png";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { API } from "@/components/utils/Constant";

const UserSideBar = () => {
  const path = usePathname();
  const router = useRouter();

  const sidebarItems = [
    {
      type: "link",
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      type: "dropdown",
      key: "gpdx",
      label: "Gpdx",
      basePath: "/admin/gpdx",
      icon: Layers,
      children: [
        {
          label: "University-List",
          href: "/admin/gpdx/university",
          icon: School,
        },
        {
          label: "External-List",
          href: "/admin/gpdx/external",
          icon: ListChecks,
        },
      ],
    },
    {
      type: "dropdown",
      key: "course",
      label: "Course",
      basePath: "/admin/courses",
      icon: BookOpen,
      children: [
        { label: "Online", href: "/admin/courses/online",icon: BookOpen },
        { label: "Offline", href: "/admin/courses/offline",icon: BookOpen },
      ],
    },
    {
      type: "dropdown",
      key: "uploadCourse",
      label: "Upload course",
      basePath: "/admin/upload-course",
      icon: UploadCloud,
      children: [
        {
          label: "New course add",
          href: "/admin/upload-course/new",
          icon: PlusCircle,
        },
        {
          label: "Existing course edit",
          href: "/admin/upload-course/existing",
          icon: Pencil,
        },
      ],
    },
    // {
    //   type: "dropdown",
    //   key: "certificate",
    //   label: "Certificate",
    //   basePath: "/admin/certificate",
    //   children: [
    //     { label: "Demo", href: "/admin/certificate/demo-1" },
    //     { label: "Demo", href: "/admin/certificate/demo-2" },
    //   ],
    // },
    // { type: "link", label: "Postcertificate", href: "/admin/postcertificate" },
    // { type: "link", label: "Applicants", href: "/admin/applicants" },
    // { type: "link", label: "Mentors", href: "/admin/mentors" },
    // { type: "link", label: "Hyperdrive", href: "/admin/hyperdrive" },
  ];

  const [openMenus, setOpenMenus] = useState({
    gpdx: !!path?.startsWith("/admin/gpdx"),
    course: !!path?.startsWith("/admin/courses"),
    uploadCourse: !!path?.startsWith("/admin/upload-course"),
  });
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className="
        fixed left-0 top-0 h-screen
        xl:flex
        w-16 md:w-32 lg:w-44 xl:w-64 2xl:w-92
        bg-[#101359]
        font-dm-sans
        flex-col
        transition-all duration-300
        z-40
      "
    >
      <div
        className="flex flex-col items-center justify-center py-4 md:py-0 hover:cursor-pointer"
        onClick={() => router.push("/")}
      >
        <Image src={logo} alt="logo" className="w-12 md:w-20 lg:w-36 mt-3" />
        <span className="text-gray-300 lg:font-semibold text-xs text-center">
          Admin Panel
        </span>
      </div>
      <div className="border-b border-white/30 mb-5" />

      <nav className="flex flex-col gap-2 px-2 md:px-4">
        {sidebarItems.map((item) => {
          if (item.type === "dropdown") {
            const isActive = path?.startsWith(item.basePath);
            const isOpen = !!openMenus[item.key] || !!isActive;
            const Icon = item.icon || LayoutDashboard;

            return (
              <div key={item.key} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleMenu(item.key)}
                  className={`
                    w-full
                    flex items-center
                    justify-center lg:justify-between
                    gap-0 md:gap-3
                    px-2 md:px-4 py-3
                    rounded-md
                    transition
                    ${
                      isActive
                        ? "bg-[#45D2FF] text-white"
                        : "text-white hover:bg-white/10"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon color="white" />
                    <span className="hidden md:inline text-sm">{item.label}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`hidden md:inline transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-2 lg:pl-12">
                    {item.children.map((subItem) => {
                      const subActive = path === subItem.href;
                      const SubIcon = subItem.icon;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`
                            flex items-center
                            justify-center lg:justify-start
                            gap-0 md:gap-3
                            px-2 md:px-4 py-2
                            rounded-md
                            transition
                            ${
                              subActive
                                ? "bg-[#45D2FF] text-white"
                                : "text-white/90 hover:bg-white/10"
                            }
                          `}
                        >
                          {SubIcon ? <SubIcon color="white" size={18} /> : null}
                          <span className="hidden md:inline text-sm">
                            {subItem.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = path === item.href;
          const Icon = item.icon || LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center
                justify-center lg:justify-start
                gap-0 md:gap-3
                px-2 md:px-4 py-3
                rounded-md
                transition
                ${
                  active
                    ? "bg-[#45D2FF] text-white"
                    : "text-white hover:bg-white/10"
                }
              `}
            >
              <Icon color="white" />
              <span className="hidden md:inline text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-gray-200">
        <button
          type="button"
          disabled={loggingOut}
          onClick={async () => {
            setLoggingOut(true);
            try {
              // If your token cookie is httpOnly, only the backend can clear it.
              const paths = ["admin/logout", "logout", "admin/signout"];
              let ok = false;
              for (const path of paths) {
                try {
                  const res = await fetch(`${API}${path}`, {
                    method: "POST",
                    credentials: "include",
                  });
                  if (res.ok) {
                    ok = true;
                    break;
                  }
                  if (res.status === 404 || res.status === 405) continue;
                  break;
                } catch {
                  // ignore and continue fallback
                }
              }
              if (!ok) {
                // As a fallback, try GET logout (some backends use GET for logout).
                for (const path of paths) {
                  try {
                    const res = await fetch(`${API}${path}`, {
                      method: "GET",
                      credentials: "include",
                    });
                    if (res.ok) break;
                  } catch {
                    // ignore
                  }
                }
              }
            } finally {
              router.replace("/login");
              setLoggingOut(false);
            }
          }}
          className="
      w-full
      flex items-center
      gap-3
      px-12 py-3
      text-sm
      bg-red-600
      text-white
      hover:bg-blue-500 hover:cursor-pointer
      transition
      disabled:opacity-60 disabled:hover:bg-red-600 disabled:hover:cursor-not-allowed
    "
        >
          <LogOut size={20} className="shrink-0" />
          <span className="hidden md:block font-medium text-center">
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default UserSideBar;
