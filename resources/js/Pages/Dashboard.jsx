import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { summary } = usePage().props;

  // ✅ Filter out null or empty productlines
  const validProductlines = Object.entries(summary.productline_totals || {}).filter(
    ([key]) => key && key.trim() !== ""
  );

  const productlineLabels = validProductlines.map(([key]) => key);
  const productlineValues = validProductlines.map(([_, value]) => value);

 const colors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f472b6", // pink
];

// 🔹 Generate bar chart data with dynamic colors
const barData = {
  labels: productlineLabels,
  datasets: [
    {
      label: "Total Lots",
      data: productlineValues,
      backgroundColor: productlineLabels.map(
        (_, i) => colors[i % colors.length] // cycle colors
      ),
    },
  ],
};


  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Total Lots per Productline (Not Null)",
        font: { size: 16 },
      },
    },
  };

  // ✅ Pie Chart (Status per Productline)
  const statusLabels = Object.keys(summary.status_totals || {});
  const statusValues = Object.values(summary.status_totals || {});

  const pieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: [
          "#10b981", // green
          "#f59e0b", // yellow
          "#ef4444", // red
          "#3b82f6", // blue
          "#8b5cf6", // violet
          "#14b8a6", // teal
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false, // 👈 Para maliit lang
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: "Status Distribution per Productline",
        font: { size: 16 },
      },
    },
  };

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Summary</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Total Uploads</h2>
            <p className="text-2xl font-bold text-blue-700">{summary.total_uploads}</p>
          </div>

          <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Total Lots</h2>
            <p className="text-2xl font-bold text-green-700">{summary.total_lots}</p>
          </div>

          <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Total Productlines</h2>
            <p className="text-2xl font-bold text-yellow-700">
              {summary.total_productlines}
            </p>
          </div>

          <div className="bg-purple-100 border-l-4 border-purple-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Latest Upload</h2>
            <p className="text-2xl font-bold text-purple-700">
              {summary.latest_upload
                ? new Date(summary.latest_upload).toLocaleDateString("en-US")
                : "N/A"}
            </p>
          </div>

          <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Empty Productline Records</h2>
            <p className="text-2xl font-bold text-red-700">
              {summary.no_productline_count}
            </p>
          </div>

          <div className="bg-orange-100 border-l-4 border-orange-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Empty Status Records</h2>
            <p className="text-2xl font-bold text-orange-700">{summary.no_status_count}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <Bar data={barData} options={barOptions} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow h-[450px] flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
