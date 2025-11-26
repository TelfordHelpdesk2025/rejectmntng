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
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { summary } = usePage().props;

  // ✅ Extract data from backend
  const productlines = summary.productlines || [];
  const chartData = summary.chart_data || {};

  // ✅ Define color palette
 const statusColors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#c084fc", // light purple
  "#4ade80", // mint green
  "#f97316", // orange
  "#22c55e", // emerald
  "#eab308", // amber
  "#9333ea", // indigo
  "#ec4899", // rose
  "#38bdf8", // light blue
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f472b6", // pink
  "#0ea5e9", // sky blue
  "#14b8a6", // teal
  "#a855f7", // violet
  "#f43f5e", // coral red

];


  // ✅ Convert backend structure into stacked bar datasets
  const datasets = Object.keys(chartData).map((status, index) => ({
    label: status,
    data: productlines.map((pline) => chartData[status][pline] || 0),
    backgroundColor: statusColors[index % statusColors.length],
  }));

  const stackedBarData = {
    labels: productlines,
    datasets,
  };

  const stackedBarOptions = {
  responsive: true,
  maintainAspectRatio: false, // 🔹 allows custom height
  plugins: {
    legend: {
      position: "bottom",
      labels: { boxWidth: 20, font: { size: 12 } },
    },
    title: {
      display: true,
      text: "Status per Productline (Stacked Bar)",
      font: { size: 16 },
    },
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
};




  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-amber-500 animate-bounce"><i className="fa-solid fa-chart-column mr-1"></i>Dashboard Summary</h1>

        {/* ✅ Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Total Lots</h2>
            <p className="text-2xl font-bold text-blue-700">{summary.total_uploads}</p>
          </div>

          <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Total Lots (PL1)</h2>
            <p className="text-2xl font-bold text-green-700">{summary.total_lots_pl1}</p>
          </div>

          <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded-lg shadow">
            <h2 className="text-sm font-semibold text-gray-600">Total Lots (PL6)</h2>
            <p className="text-2xl font-bold text-yellow-700">
              {summary.total_lots_pl6}
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

        {/* ✅ Stacked Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow h-[450px]">
  <Bar data={stackedBarData} options={stackedBarOptions} />
</div>


      </div>
    </AuthenticatedLayout>
  );
}
