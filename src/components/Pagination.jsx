// components/common/Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Helper function to generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show first few pages
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last few pages
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex rounded-md shadow-sm">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-accent-300 rounded-l-md bg-white text-primary-500 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Prev
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 border-t border-b border-accent-300 bg-white text-gray-500 text-sm"
              >
                ...
              </span>
            );
          }
          
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`px-3 py-2 border-t border-b border-accent-300 text-sm ${
                currentPage === pageNumber
                  ? "bg-primary-400 text-white"
                  : "bg-white text-primary-500 hover:bg-secondary-100"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-accent-300 rounded-r-md bg-white text-primary-500 hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;