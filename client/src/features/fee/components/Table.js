import React from "react";

const Table = ({ value, FeeFunction }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Pasport</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {value
            ? value.map((l, k) => {
                return (
                  <tr key={k}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-bold">
                            {l.firstName + " " + l.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{l.phone}</td>
                    <td>{l.pasport}</td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
