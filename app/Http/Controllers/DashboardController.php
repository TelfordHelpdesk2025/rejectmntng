<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {


        $connection = DB::connection('mysql');

        $summary = [
            // ✅ Total uploaded records
            'total_uploads' => $connection->table('reject_tbl_list')->count(),

            // ✅ Total lots (PL1)
            'total_lots_pl1' => $connection->table('reject_tbl_list')
                ->whereNotNull('productline')
                ->where('productline', 'PL1')
                ->count(),

            // ✅ Total lots (PL6)
            'total_lots_pl6' => $connection->table('reject_tbl_list')
                ->whereNotNull('productline')
                ->where('productline', 'PL6')
                ->count(),

            // ✅ Latest upload date
            'latest_upload' => $connection->table('reject_tbl_list')->max('uploaded_date'),

            // ✅ Count of records with empty or null productline
            'no_productline_count' => $connection->table('reject_tbl_list')
                ->whereNull('productline')
                ->orWhere('productline', '')
                ->count(),

            // ✅ Count of records with empty or null status
            'no_status_count' => $connection->table('reject_tbl_list')
                ->whereNull('status')
                ->orWhere('status', '')
                ->count(),
        ];

        // ✅ Get status counts per productline
        $status_per_productline = DB::table('reject_tbl_list')
            ->whereNotNull('productline')
            ->where('productline', '!=', '')
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->select('productline', 'status', DB::raw('COUNT(*) as total'))
            ->groupBy('productline', 'status')
            ->get();

        // ✅ Rebuild structured array for chart
        $chartData = [];
        foreach ($status_per_productline as $row) {
            $chartData[$row->status][$row->productline] = $row->total;
        }

        // ✅ Ensure missing combinations are filled with 0
        $productlines = DB::table('reject_tbl_list')
            ->whereNotNull('productline')
            ->where('productline', '!=', '')
            ->distinct()
            ->pluck('productline')
            ->toArray();

        foreach ($chartData as $status => &$data) {
            foreach ($productlines as $pline) {
                if (!isset($data[$pline])) {
                    $data[$pline] = 0;
                }
            }
        }

        // ✅ Summary data
        $summary['chart_data'] = $chartData;
        $summary['productlines'] = $productlines;

        // $emp_data = session('emp_data');

        // dd($emp_data);



        return Inertia::render('Dashboard', [
            'summary' => $summary,
        ]);
    }
}
