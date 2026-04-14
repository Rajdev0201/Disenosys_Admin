"use client";
import React, {useState } from "react";
import { Bell, Search } from "lucide-react";
// import { useSelector } from "react-redux";
// import NotificationModal from "../modal/Notification";

const UserHeader = ({admin}) => {
//   const { data} = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);


  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 xl:px-12 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-45 sm:max-w-xs lg:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search"
            className="
              w-64
              border-2 border-[#101359] shadow
              rounded-sm
              pl-9 pr-3 py-1.5
              text-sm
              focus:outline-none
            "
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Notification */}
          <div className="relative">
            {/* Bell */}
            <button
              onClick={() => setOpen(true)}
              className="relative bg-[#F9F8F9] p-2 rounded-full hover:bg-gray-100 transition hover:cursor-pointer"
            >
              <Bell size={22} className="text-gray-700" />

              {/* Unread dot */}
              <span className="absolute top-1 right-1 block h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Modal */}
            {/* <NotificationModal open={open} onClose={() => setOpen(false)} /> */}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center font-semibold">
              {/* <span>{data?.userName?.charAt(0)?.toUpperCase()}</span> */}
              <span>{admin?.userName?.charAt(0)?.toUpperCase()}</span>
            </div>

            {/* Hide text on mobile */}
            <div className="hidden sm:flex flex-col font-dm-sans leading-tight">
              <h4 className="text-sm font-bold text-black">{admin?.userName}</h4>
              <h5 className="text-xs text-[#808080] font-medium">
                {/* {data?.userEmail}  */} {admin?.userEmail}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
