import React from "react";
import { Link } from "react-router-dom";
import "./table.css";
import Pagination from "../pagination/pagination";
import Button from "../button/button";

function Table({
  columns = [],
  rows = [],
  name = "table",
  total = 0,
  handlePagination = () => {},
  onCellClick,
}) {

  const handleChange = (current, pageSize) => {
    handlePagination(current, pageSize);
  };

  const showTotal = (count, range) => {
    return `${range[0]} - ${range[1]} ${("of")} ${count} ${("records")}`;
  };

  return (
    <div>
      <div className="table">
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={`${name}-header-${index}`}>
                  {/* {("column.name")} */}
                  <span className="unit">
                    {column.name ? (column.name) : "null"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  data-label="Info"
                  className="text-center"
                >
                  {("No Data Available")}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={`${name}-row-${rowIndex}`}>
                  {columns.map((column, colIndex) => {
                    const cellKey = `${name}-row-${rowIndex}-${colIndex}`;

                    if (column.type === "link") {
                      const baseUrl = column.baseUrl || "";
                      const params = column.paramsKey
                        ? row[column.paramsKey]
                        : row[column.key];
                      const url = `${baseUrl}/${params}`;

                      return (
                        <td
                          key={cellKey}
                          data-label={column.name}
                          style={{ textDecoration: "none", color: "black" }}
                        >
                          <Link to={url} className="table-link">
                            {row[column.key]}
                          </Link>
                        </td>
                      );
                    }

                    if (column.type === "action") {
                      return (
                        <td key={cellKey} data-label={column.name}>
                          <Button
                            btype="primary"
                            btTitle={column.label || column.name}
                            onClick={() =>
                              column.action(
                                column.targetKey
                                  ? row[column.targetKey]
                                  : row[column.key]
                              )
                            }
                          />
                        </td>
                      );
                    }

                    const value =
                      column.type === "nested"
                        ? Object.values(row[column.key] || {}).join(", ")
                        : row[column.key];

                    return (
                      <td
                        key={cellKey}
                        data-label={column.name}
                        onClick={() =>
                          onCellClick && onCellClick(row, column)
                        }
                        style={{
                          cursor: onCellClick ? "pointer" : "default",
                        }}
                      >
                        {value === null || value === undefined || value === "" || value === "NaN"
                          ? "----"
                          : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        total={total}
        handleChange={handleChange}
        showTotal={showTotal}
      />
    </div>
  );
}

export default Table;