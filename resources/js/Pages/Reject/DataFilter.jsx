import React, { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function DataFilter() {
  const { data, filters, selectedColumn: initColumn, selectedValue: initValue, selectedDate: initDate } = usePage().props;

  const columns = [
    { key: "productline", label: "PL" },
    { key: "part_name", label: "Part Name" },
    { key: "lot_id", label: "Lot ID" },
    { key: "qty", label: "Qty" },
    { key: "lot_type", label: "Lot Type" },
    { key: "station", label: "Station" },
    { key: "package_name", label: "Package Name" },
    { key: "stage_run_days", label: "Stage Run Days" },
    { key: "status", label: "Status" },
    { key: "remarks", label: "Remarks" },
  ];

const [selectedColumn, setSelectedColumn] = useState(initColumn || "");
const [selectedValue, setSelectedValue] = useState(initValue || "");
const [selectedDate, setSelectedDate] = useState(initDate || "");
  const [columnValues, setColumnValues] = useState([]);

  

 useEffect(() => {
  if (selectedColumn && filters[selectedColumn]) {
    setColumnValues(filters[selectedColumn]);

    // only reset if current selectedValue is not in new columnValues
    if (!filters[selectedColumn].includes(selectedValue)) {
      setSelectedValue("");
    }
  } else {
    setColumnValues([]);
    setSelectedValue("");
  }
}, [selectedColumn, filters]);


  const handleFilter = () => {
    if (!selectedColumn || (!selectedValue && !selectedDate)) return;

    router.get(route("data.filter"), {
      column: selectedColumn,
      value: selectedValue.trim(),
      uploaded_date: selectedDate,
    });
  };

const handleExport = () => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Prepare CSV content
  const headers = [
    'PL',
    'Part Name',
    'Lot ID',
    'Qty',
    'Lot Type',
    'Station',
    'Package Name',
    'Stage Run Days',
    'Status',
    'Remarks',
  ];

  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(h => {
        const key = h
          .toLowerCase()
          .replace(/ /g, '_'); // match your table keys
        return `"${row[key] ?? ''}"`;
      }).join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `filtered_data_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};





  const showEnabled = (selectedColumn && selectedValue) || selectedDate;
  const exportEnabled = data && data.length > 0;

  return (
    <AuthenticatedLayout>
      <Head title="Data Filter & Export" />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">
          <i className="fa-solid fa-filter mr-2"></i>Data Filter & Export
        </h1>

        {/* Note */}
        <div className="flex items-center mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
  <svg
    className="w-5 h-5 mr-2 flex-shrink-0"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-9-4a1 1 0 012 0v4a1 1 0 01-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
      clipRule="evenodd"
    />
  </svg>
  <span>
    Note: Please click <strong>Show</strong> to display your filtered data before exporting. This ensures that the CSV contains exactly what is displayed.
  </span>
</div>


        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column */}
          <div>
            <label className="block text-sm font-medium mb-1">Filter Column</label>
            <select
              className="w-full border rounded p-2"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="">Select Column</option>
              {columns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          {/* Column Value */}
          <div>
            <label className="block text-sm font-medium mb-1">Column Value</label>
            <select
              className="w-full border rounded p-2"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              disabled={!selectedColumn}
            >
              <option value="">Select Value</option>
              {columnValues.map((val, idx) => (
                <option key={idx} value={val}>
                  {val || "—"}
                </option>
              ))}
            </select>
          </div>

          {/* Uploaded Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Uploaded Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!showEnabled}
            >
              <i className="fa-solid fa-filter mr-2"></i>
              Show
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={!exportEnabled}
            >
              <i className="fa-solid fa-file-export mr-2"></i>
              Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th key={col.key} className="border px-3 py-2">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="border px-3 py-2">
                        {row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center p-4 text-gray-500"
                  >
                    No data to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
