<?php

namespace App\Http\Controllers\Rejects;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Exports\ArrayExport;
use Maatwebsite\Excel\Facades\Excel;

class DataFilterController extends Controller
{
    public function filterPage(Request $request)
    {
        $column = $request->get('column');
        $value = $request->get('value');
        $uploaded_date = $request->get('uploaded_date');

        $query = DB::table('reject_tbl_list');

        if ($column && $value) {
            $query->whereRaw("TRIM($column) = ?", [trim(urldecode($value))]);
        }

        if ($uploaded_date) {
            $query->whereDate('uploaded_date', '=', $uploaded_date);
        }

        $data = $query->get([
            'productline',
            'part_name',
            'lot_id',
            'qty',
            'lot_type',
            'station',
            'package_name',
            'stage_run_days',
            'status',
            'remarks',
        ]);

        // Dropdown filters
        $filters = [];
        $filterColumns = [
            'productline',
            'part_name',
            'lot_id',
            'lot_type',
            'station',
            'package_name',
            'status',
        ];

        foreach ($filterColumns as $col) {
            $filters[$col] = DB::table('reject_tbl_list')
                ->distinct()
                ->whereNotNull($col)
                ->pluck($col)
                ->filter()
                ->values();
        }

        return Inertia::render('Reject/DataFilter', [
            'data' => $data,
            'filters' => $filters,
            'selectedColumn' => $column,
            'selectedValue' => $value,
            'selectedDate' => $uploaded_date,
        ]);
    }

    public function export(Request $request)
    {
        $query = DB::table('reject_tbl_list');

        if ($request->column && $request->value) {
            $query->whereRaw("TRIM({$request->column}) = ?", [trim(urldecode($request->value))]);
        }

        if ($request->uploaded_date) {
            $query->whereDate('uploaded_date', '=', $request->uploaded_date);
        }

        $data = $query->get([
            'productline',
            'part_name',
            'lot_id',
            'qty',
            'lot_type',
            'station',
            'package_name',
            'stage_run_days',
            'status',
            'remarks',
        ])->toArray();

        if (empty($data)) {
            return response('No data to export', 400);
        }

        return Excel::download(
            new ArrayExport($data),
            'filtered_data_' . now()->format('Ymd_His') . '.xlsx'
        );
    }
}
