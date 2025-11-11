import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SummaryExport() {
  const { availableDates } = usePage().props;
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch filtered summary data
  const handleShow = async () => {
    if (!selectedDate) return alert("Please select a date first.");
    setLoading(true);
    try {
      const response = await fetch(`/reject/export-summary/${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Failed to load summary data.");
    } finally {
      setLoading(false);
    }
  };

  // Export current filtered data (tables + charts) to PDF
 const handleExportPDF = () => {
    if (!selectedDate) return alert("Select a date first");
    window.open(`/reject/export-pdf/${selectedDate}`, '_blank');
};


  return (
    <AuthenticatedLayout>
      <Head title="Filtered Summary Export" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">
          <i className="fa-solid fa-filter mr-2"></i>Filtered Summary Export
        </h1>

        {/* Filter controls */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 dark:text-gray-700">
            <label className="font-medium text-gray-700">Select Date:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg p-2 w-64 focus:ring focus:ring-blue-200"
            >
              <option value="">Select date</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShow}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={!selectedDate || loading}
            >
              <i className="fa-solid fa-eye mr-1"></i>
              {loading ? "Loading..." : "Show Data"}
            </button>

            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              disabled={!data}
            >
              <i className="fa-solid fa-file-pdf mr-1"></i> Export PDF
            </button>
          </div>
        </div>

        {/* Filtered data display */}
        {loading ? (
          <p className="text-center text-gray-500 italic">Loading data...</p>
        ) : data ? (
          <div id="export-pdf" className="bg-white text-gray-800 p-4">
            <Section
              title="Distribution per Product Line"
              data={data.distribution}
              dataKey="total_lots"
              xKey="productline"
            />
            <SectionPerStatus
              title="Breakdown per Product Line per Status"
              data={data.per_status}
            />
            <Section
              title="Number of Lot ID per Stage Run Days"
              data={data.stage_days}
              dataKey="total_lots"
              xKey="bracket"
            />
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No data to display. Select a date and click “Show Data”.
          </p>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

// Table + chart section
function Section({ title, data, dataKey, xKey }) {
  if (!data?.length) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow my-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(data[0]).map((col) => (
                <th
                  key={col}
                  className="border px-3 py-2 capitalize text-gray-600"
                >
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                {Object.keys(row).map((col) => (
                  <td key={col} className="border px-3 py-2">
                    {row[col] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Stacked bars per status
function SectionPerStatus({ title, data }) {
  if (!data?.length) return null;

  const productlines = [...new Set(data.map((d) => d.productline ?? "Unknown"))];
  const statuses = [...new Set(data.map((d) => d.status ?? "Unknown"))];

  const chartData = productlines.map((pl) => {
    const obj = { productline: pl };
    statuses.forEach((status) => {
      const match = data.find(
        (d) => (d.productline ?? "Unknown") === pl && (d.status ?? "Unknown") === status
      );
      obj[status] = match ? match.lot_count : 0;
    });
    return obj;
  });

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a0522d", "#8a2be2", "#00ced1"];

  return (
    <div className="bg-white p-4 rounded-lg shadow my-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>

      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {["productline", ...statuses].map((col) => (
                <th key={col} className="border px-3 py-2 capitalize">
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                {["productline", ...statuses].map((col) => (
                  <td key={col} className="border px-3 py-2">
                    {row[col] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="productline" />
          <YAxis />
          <Tooltip />
          <Legend />
          {statuses.map((status, idx) => (
            <Bar key={status} dataKey={status} stackId="a" fill={colors[idx % colors.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
