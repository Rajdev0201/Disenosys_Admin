import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 6) {
      // Show all pages if small
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Large pagination with dots
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4,5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-4 text-sm text-gray-700">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
      >
        &#60;
      </button>

      {/* Page Buttons */}
      {pages.map((page, index) => (
        <button
          key={index}
          disabled={page === "..."}
          onClick={() => typeof page === "number" && onPageChange(page)}
          className={`px-3 py-1 rounded-md font-medium ${
            page === currentPage
              ? "bg-sky-400 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40"
      >
        &#62;
      </button>
    </div>
  );
};

export default Pagination;
