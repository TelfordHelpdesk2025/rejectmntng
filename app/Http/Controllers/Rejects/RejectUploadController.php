<?php

namespace App\Http\Controllers\Rejects;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\RejectImport;

class RejectUploadController extends Controller
{
    public function uploadExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new RejectImport, $request->file('file'));

        return response()->json(['message' => 'Excel data imported successfully!']);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv']);
        Excel::import(new RejectImport, $request->file('file'));
        return back()->with('success', 'File imported successfully.');
    }
}
