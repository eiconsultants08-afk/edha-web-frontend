import { Link } from "react-router-dom";
import "./paginated_table.css";
import Button from "../button/button";
import Pagination from "../pagination/pagination";


function Table(props) {
  const { columns, rows, name, total, handlePagination, } = props;
  
  const headers = () => {
    const key = `${name}-header`;
    return (
      <tr key={key}>
        {columns.map((column, index) => {
          return (
            <th key={`${key}-${index}`}>
              {column.name}
              <span className="unit">{column.unit ? (column.unit) : ""}</span>
            </th>
          );
        })}
      </tr>
    );
  };

  const data = () => {
    if (rows.length === 0) {
      const key = `${name}-row-no-data`;
      const ckey = `${name}-no-data`;
      return (
        <tr key={key}>
          <td
            key={ckey}
            colSpan={columns.length}
            data-label="Info"
            className="text-center"
          >
            {'No Data Available'}
          </td>
        </tr>
      );
    }
    return rows.map((row, index) => {
      const key = `${name}-row-${index}`;
      return (
        <tr key={key}>
          {columns.map((column, ind) => {
            const ckey = `${key}-${ind}`;
            if (column.type === "link") {
              const baseUrl = column.baseUrl ? column.baseUrl : "";
              const intialParams = column.intialParams ? column.intialParams : null 
              const params = column.paramsKey
                ? row[column.paramsKey]
                : row[column.key];
                
              const url = `${baseUrl}/${intialParams ? `${intialParams}/` : ''}${params}`;

              return (
                <td
                  data-label={column.key}
                  key={ckey}
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <Link to={url} className="table-link">
                    {row[column.key]}
                  </Link>
                </td>
              );
            }
            else if (column.type === "action") {
              return (
                  <td data-label={column.name} key={ckey}>
                      <Button btnClass='primary' btTitle={column.label ||column.name} 
                      onClick={() => column.action(column.targetKey ? row[column.targetKey] : row[column.key])} />
                  </td>
              );
            } else {
              return (
                <td data-label={column.name} key={ckey}>
                  {!row[column.key] || row[column.key] === "NaN"
                    ? "----"
                    : column.type === "nested" ? Object.values(row[column.key]): row[column.key]}
                </td>
              );
            }
          })}
        </tr>
      );
    });
  };

  const handleChange = (current, pageSize) => {
    handlePagination(current, pageSize);
  };

  const showTotal = (total, range) => {
    return `${range[0]} - ${range[1]} ${'of'} ${total} ${'records'}`;
  };

  return (
    <div>
      <div className="table">
        <table>
          <thead>{headers()}</thead>
          <tbody>{data()}</tbody>
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
