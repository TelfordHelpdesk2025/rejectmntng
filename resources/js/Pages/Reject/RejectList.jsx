import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import DataTable from "@/Components/DataTable";
import { useState } from "react";
import axios from "axios";

export default function RejectList({ tableData, tableFilters, emp_data }) {
    const [selectedRow, setSelectedRow] = useState(null);
    const [originalRow, setOriginalRow] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showPivotModal, setShowPivotModal] = useState(false);

    const [selectedDate, setSelectedDate] = useState("");


    const empPL = emp_data?.emp_prodline || "";

    // 🔹 View row
    const handleViewRow = (row) => {
        setSelectedRow({ ...row });
        setOriginalRow({ ...row });
        setViewModal(true);
    };

    // 🔹 Update local state on change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedRow((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🔹 Close modal
    const handleClose = () => {
        setViewModal(false);
        setSelectedRow(null);
        setOriginalRow(null);
    };

    // 🔹 Save changes (PUT request)
    const handleSave = () => {
        if (!selectedRow?.id) {
            alert("Missing ID — cannot update.");
            return;
        }

        Inertia.put(route("reject.update", selectedRow.id), selectedRow, {
            onSuccess: () => {
                alert("Record updated successfully!");
                setViewModal(false);
            },
            onError: (errors) => {
                console.error(errors);
                alert("Failed to update record.");
            },
        });
    };

    // 🔹 Add action button to each row
    const rowsWithActions = tableData.data.map((row) => ({
        ...row,
        actions: (
            <button
                onClick={() => handleViewRow(row)}
                className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600 hover:text-white hover:border-amber-800 border-2 border-black transition flex items-center"
            >
                <i className="fas fa-eye mr-1"></i>
                View
            </button>
        ),
    }));

    // 🟩 Import Modal State
    const [importModal, setImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState("success");

    // 🟩 File Handlers
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // 🟩 Import Excel with Loading + Alert
    const handleImport = async () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        setIsLoading(true);
        setAlertMessage(null);

        const formData = new FormData();
        formData.append("file", selectedFile);



        try {
            const response = await axios.post(route("reject.import"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAlertType("success");
            setAlertMessage(`✅ File imported successfully! ${response.data.duplicateCount ?? 0} duplicate rows skipped.`);
            setSelectedFile(null);

            // Auto close after 2s
            setTimeout(() => {
                setIsLoading(false);
                setImportModal(false);
                setAlertMessage(null);
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error(error);
            setAlertType("error");
            setAlertMessage("❌ Failed to import file.");
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reject List" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-amber-500 animate-bounce">
                    <i className="fa-solid fa-microchip"></i> Reject List
                </h1>
            {["Quality Assurance"].includes(emp_data?.emp_dept) && ["Senior QA Supervisor", "QA Supervisor", "QA Section Head", "QA Sr. Section Head", "QA Manager"].includes(emp_data?.emp_jobtitle) &&(
                <div>
                {/* <button
                    onClick={() => setShowPivotModal(true)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 mr-2"
                >
                    <i className="fas fa-table mr-2"></i>
                    Pivot Report
                </button> */}

                <button
                    onClick={() => setImportModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    <i className="fas fa-file-import mr-2"></i>
                    Import Excel
                </button>



                </div>
            )}
            </div>

            <DataTable
                columns={[
                    { key: "productline", label: "PL" },
                    { key: "part_name", label: "Part Name" },
                    { key: "lot_id", label: "Lot ID" },
                    { key: "qty", label: "Qty" },
                    { key: "package_name", label: "Package Name" },
                    { key: "lead_count", label: "Lead Count" },
                    { key: "stage_run_days", label: "Stage Run Days" },
                    { key: "status", label: "Status" },
                    { key: "actions", label: "Actions" },
                ]}
                data={rowsWithActions}
                meta={{
                    from: tableData.from,
                    to: tableData.to,
                    total: tableData.total,
                    links: tableData.links,
                    currentPage: tableData.current_page,
                    lastPage: tableData.last_page,
                }}
                routeName={route("reject.index")}
                filters={tableFilters}
                rowKey="lot_id"
                showExport={false}
            />

            {/* 🟢 View Modal */}
            {viewModal && selectedRow && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-5xl text-gray-800">
                        <h2 className="text-xl font-semibold mb-4 text-amber-400 animate-pulse">
                            <i className="fa-solid fa-microchip"></i> Lot Details
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                "part_name",
                                "lot_id",
                                "qty",
                                "package_name",
                                "lead_count",
                                "stage_run_days",
                            ].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium capitalize">
                                        {field.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={selectedRow[field] || ""}
                                        onChange={handleChange}
                                        className="w-full border rounded p-2 cursor-not-allowed bg-gray-100"
                                        readOnly
                                    />
                                </div>
                            ))}

                            {/* Product Line */}
                            <div>
                                <label className="block text-sm font-medium">
                                    Product Line
                                </label>
                                {!originalRow?.productline ? (
                                    <>
                                        <input
                                            list="productlineOptions"
                                            type="text"
                                            name="productline"
                                            value={selectedRow.productline || ""}
                                            onChange={handleChange}
                                            placeholder="Enter Productline..."
                                            className="w-full border rounded p-2"
                                        />
                                        <datalist id="productlineOptions">
                                            <option value="PL1" />
                                            <option value="PL6" />
                                        </datalist>
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        name="productline"
                                        value={selectedRow.productline || ""}
                                        className="w-full border rounded p-2 cursor-not-allowed bg-gray-100"
                                        readOnly
                                    />
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium">
                                    Status
                                </label>
                                {!originalRow?.status ? (
                                    <>
                                        <input
                                            list="statusOptions"
                                            name="status"
                                            value={selectedRow.status || ""}
                                            onChange={handleChange}
                                            className="w-full border rounded p-2"
                                            placeholder="Select or type status"
                                            required
                                        />
                                        <datalist id="statusOptions">
                                            <option value="ADGT LOT" />
                                            <option value="MOVED LOT TO GTREEL_T  LTC PER ECN01132944" />
                                            <option value="MOVED LOT TO GTREEL_T LTC PER ECN0133910" />
                                            <option value="GTARCH_T LOCATION" />
                                            <option value="Under Production" />
                                            <option value="COMPLETED/MOVED TO GTTCRUSH" />
                                        </datalist>
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        name="status"
                                        value={selectedRow.status || ""}
                                        className="w-full border rounded p-2 cursor-not-allowed bg-gray-100"
                                        readOnly
                                    />
                                )}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-medium mt-4">
                                Remarks
                            </label>
                            {!originalRow?.remarks ? (
                                <textarea
                                    name="remarks"
                                    id="remarks"
                                    value={selectedRow.remarks || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded p-2"
                                    required
                                />
                            ) : (
                                <textarea
                                    name="remarks"
                                    id="remarks"
                                    value={selectedRow.remarks || ""}
                                    className="w-full border rounded p-2 cursor-not-allowed bg-gray-100"
                                    readOnly
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            >
                                <i className="fas fa-times mr-1"></i> Cancel
                            </button>

                            {(!originalRow?.productline &&
                                !originalRow?.status &&
                                !originalRow?.remarks) && (
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    <i className="fas fa-save mr-1"></i> Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🟢 Import Modal */}
            {importModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative bg-gradient-to-r from-blue-200 to-green-400 text-gray-800">
                        {alertMessage && (
                            <div
                                className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-[90%] text-center px-4 py-2 rounded ${
                                    alertType === "success"
                                        ? "bg-green-100 text-green-700 border border-green-400"
                                        : "bg-red-100 text-red-700 border border-red-400"
                                }`}
                            >
                                {alertMessage}
                            </div>
                        )}

                        <h2 className="text-lg font-semibold mb-4 mt-6 text-green-600">
                            <i className="fas fa-file-excel text-green-600 mr-2"></i>
                            Import Excel File
                        </h2>

                        <div
                            className={`border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer transition ${
                                isLoading ? "opacity-50 pointer-events-none" : "hover:bg-gray-50"
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => !isLoading && document.getElementById("excelInput").click()}
                        >
                            <input
                                type="file"
                                id="excelInput"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {selectedFile ? (
                                <p className="text-gray-700">
                                    <i className="fas fa-file-excel text-green-600 mr-2"></i>
                                    {selectedFile.name}
                                </p>
                            ) : (
                                <p className="text-gray-500">
                                    Drag and drop Excel file here, or{" "}
                                    <span className="text-blue-600 underline">browse</span>
                                </p>
                            )}
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center mt-4">
                                <i className="fas fa-spinner fa-spin text-blue-600 mr-2"></i>
                                <span className="text-gray-700 animate-pulse">Importing... Please wait</span>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    if (!isLoading) {
                                        setImportModal(false);
                                        setSelectedFile(null);
                                        setAlertMessage(null);
                                    }
                                }}
                                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                <i className="fas fa-times mr-1"></i> Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
                                disabled={!selectedFile || isLoading}
                            >
                                <i className="fas fa-upload mr-1"></i> Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

{showPivotModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gradient-to-r from-yellow-200 to-purple-400 rounded-xl shadow-2xl w-full max-w-md p-6 text-white animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-800">
          <i className="fas fa-filter mr-2"></i>Pivot Filter
        </h2>
        <button
          onClick={() => setShowPivotModal(false)}
          className="text-red-500 hover:text-red-700 transition-colors text-xl font-semibold"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Date Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-sky-800 mb-2">
          <i className="fas fa-calendar mr-2"></i>
          Select Uploaded Date
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black dark:text-black"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowPivotModal(false)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition flex items-center"
        >
          <i className="fa-solid fa-circle-xmark mr-2"></i>Close
        </button>

        <button
          onClick={() => {
            if (selectedDate) {
              window.location.href = route("reject.pivot", { date: selectedDate });
            } else {
              alert("Please select a date first!");
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition flex items-center"
        >
          <i className="fa-solid fa-gear mr-2"></i>Generate
        </button>
      </div>
    </div>
  </div>
)}




        </AuthenticatedLayout>
    );
}
