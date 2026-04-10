import React, { useState } from "react";
import "./pagination.css";
// import { TranslationProvider } from "../../context/TranslationProvider";

function Pagination({ total = 0, handleChange, showTotal }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // const { t } = useContext(TranslationProvider);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const onChange = (page, noOfRows) => {
    const pageSize = Number(noOfRows);
    let nextPage = Number(page);

    if (nextPage < 1) {
      nextPage = 1;
    } else if (pageSize * (nextPage - 1) >= total && total > 0) {
      nextPage = Math.ceil(total / pageSize);
    }

    if (nextPage === currentPage && pageSize === rowsPerPage) {
      return;
    }

    setCurrentPage(nextPage);
    setRowsPerPage(pageSize);
    handleChange(nextPage, pageSize);
  };

  const startRecord = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, total);

  return (
    <div className="pagination">
      <div className="filters-page">
        <div>
          <span>{("Rows per page")}:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onChange(1, e.target.value)}
            className="dropdown"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="records">
          <span>{showTotal(total, [startRecord, endRecord])}</span>
        </div>
      </div>

      <div className="current-page">
        <span
          className={currentPage <= 1 ? "disabled ml page-nav" : "ml page-nav"}
          onClick={() => currentPage > 1 && onChange(1, rowsPerPage)}
        >
          «
        </span>

        <span
          className={currentPage <= 1 ? "disabled page-nav" : "page-nav"}
          onClick={() => currentPage > 1 && onChange(currentPage - 1, rowsPerPage)}
        >
          &#60;
        </span>

        <span className="page-num">{currentPage}</span>

        <span
          className={currentPage >= totalPages ? "disabled page-nav" : "page-nav"}
          onClick={() =>
            currentPage < totalPages && onChange(currentPage + 1, rowsPerPage)
          }
        >
          &#62;
        </span>

        <span
          className={currentPage >= totalPages ? "disabled page-nav" : "page-nav"}
          onClick={() => currentPage < totalPages && onChange(totalPages, rowsPerPage)}
        >
          »
        </span>
      </div>
    </div>
  );
}

export default Pagination;