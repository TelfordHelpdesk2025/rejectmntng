import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function PivotResult({ data, uploaded_date }) {
  // 🔹 Group by productline (empty/null → "No Productline")
  const grouped = data.reduce((acc, row) => {
    const key =
      row.productline && row.productline.trim() !== ""
        ? row.productline
        : "No Productline";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  // 🔹 Compute total per productline and grand total
  const productlineTotals = {};
  let grandTotal = 0;

  Object.entries(grouped).forEach(([pl, rows]) => {
    const total = rows.reduce((sum, r) => sum + Number(r.total_lots || 0), 0);
    productlineTotals[pl] = total;
    grandTotal += total;
  });

  // 🔹 Separate "No Productline" rows
  const noPLRows = grouped["No Productline"] || [];
  delete grouped["No Productline"];

  

  return (
    <AuthenticatedLayout>
      <Head title="Pivot Result" />
        
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          

        
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          {/* Pivot Result for {uploaded_date} */}
          <i className="fas fa-calendar mr-2"></i>
          Pivot Result for Date of
          {" "}
          <div className="inline-block font-semibold text-sky-600">
            {uploaded_date
            ? new Date(uploaded_date).toLocaleDateString("en-US")
            : "N/A"}
          </div>
            
        </h1>

        <button
           onClick={() => window.open(route("reject.pivot.pdf", uploaded_date), "_blank")}
            className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-700 hover:text-white transition-colors flex items-center gap-2 animate-pulse"
          >
            <i className="fas fa-file-pdf"></i>
            View PDF
          </button>
    </div>
        {/* 🟡 Show "No Productline" first if exists */}
        {noPLRows.length > 0 && (
          <div className="mb-8 border-b pb-4">
            <h2 className="font-semibold text-lg mb-2 text-gray-800">
              No Productline —{" "}
              <span className="text-sm text-gray-500">
                Total Lots: {productlineTotals["No Productline"]}
              </span>
            </h2>
            <table className="w-full border-collapse border text-gray-800">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-center">Status</th>
                  <th className="border p-2 text-center">Total Lots</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 text-center"><i className="fas fa-circle-minus mr-2"></i>empty</td>
                  <td className="border p-2 text-center font-semibold">
                    {productlineTotals["No Productline"]}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 🟢 Productline-wise tables */}
        {Object.entries(grouped).map(([productline, rows]) => (
          <div key={productline} className="mb-8">
            <h2 className="font-semibold text-lg mb-2 text-gray-800">
              {productline} —{" "}
              <span className="text-sm text-gray-500">
                Total Lots: {productlineTotals[productline]}
              </span>
            </h2>
            <table className="w-full border-collapse border  text-gray-800">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Status</th>
                  <th className="border p-2 text-center">Total Lots</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{r.status}</td>
                    <td className="border p-2 text-center">{r.total_lots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* 🔵 Grand Total Section */}
        <div className="mt-10 border-t pt-4">
          <h2 className="text-xl font-bold text-blue-700 mb-2">
            Grand Total Lots
          </h2>
          <table className="w-full border-collapse border  text-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-center">Productline</th>
                <th className="border p-2 text-center">Total Lots</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(productlineTotals).map(([pl, total]) => (
                <tr key={pl}>
                  <td className="border p-2 text-center">{pl}</td>
                  <td className="border p-2 text-center">{total}</td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="border p-2 text-center">All Productlines</td>
                <td className="border p-2 text-center">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
