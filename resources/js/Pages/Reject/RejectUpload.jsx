import { useState } from "react";
import axios from "axios";

export default function RejectUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

 const handleUpload = async (e) => {
  const formData = new FormData();
  formData.append('file', e.target.files[0]);

  await fetch('/reject/upload', {
    method: 'POST',
    body: formData,
  });

  alert('Upload complete!');
};

  

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Upload Reject Excel File</h2>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
      >
        Upload
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
