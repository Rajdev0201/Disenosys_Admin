"use client"
import Input from "@/components/custom/Input";
import Pagination from "@/components/custom/Pagination";
import Table from "@/components/custom/Table";
import { API } from "@/components/utils/Constant";
import React, { useCallback, useEffect, useState } from "react";

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

const OnlineTable = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const columns = [
    { header: "SectionID", accessor: "sectionId" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Course", accessor: "course" },
    { header: "Price", accessor: "price" },
    {
      header: "Status",
      accessor: "status",
      render: (value) => {
        return (
          <button
            className={`relative inline-flex items-center h-6 w-11 rounded-full ${
              item.isActive ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => handleToggle(item._id, item.isActive)}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                item.isActive ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
  ];

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `${API}paymentDetails?page=${page}&limit=10&search=${search}`,
    );

    const json = await res.json();
    setData(json?.data);
    setTotalPages(json?.pagination?.totalPages);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <section className="px-12 py-5 font-dm-sans">
      <header className="space-y-1">
        <h1 className="text-primary font-medium text-2xl">
          Online Payments List
        </h1>
        <p className="text-gray-400 text-sm">
          Complete overview of all online course payments and their status.
        </p>
      </header>
      <div className="mt-5">
        <Input
          type="text"
          placeholder="Search by name, email, phone..."
          // className="px-4 py-2 border rounded-lg w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <Skeleton />
        ) : Array.isArray(data) && data.length > 0 ? (
          <Table columns={columns} data={data} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            No data available
          </div>
        )}
        {data?.length > 0 ? (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </section>
  );
};

export default OnlineTable;
