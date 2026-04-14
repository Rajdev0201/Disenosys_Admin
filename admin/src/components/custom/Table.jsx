const Table = ({ columns, data }) => {
  return (
    <div className="w-full bg-white rounded-xl">
      {/* MOBILE SCROLL WRAPPER */}
      <div className="overflow-x-auto w-full">
        
        <table className="min-w-max lg:w-full border-separate border-spacing-y-2 text-left">
          
          {/* HEADER */}
          <thead className="bg-[#f5f4f4] rounded-sm">
            <tr className="text-gray-500 text-sm">
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 font-medium whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-white hover:bg-sky-50 transition-all shadow-sm rounded-lg border border-gray-100"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-gray-700 text-sm whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row[col.accessor], row, rowIndex)
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default Table;
