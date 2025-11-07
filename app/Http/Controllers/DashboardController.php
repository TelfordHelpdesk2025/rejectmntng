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

            // ✅ Total lots (lahat ng may lot_id)
            'total_lots' => $connection->table('reject_tbl_list')
                ->whereNotNull('lot_id')
                ->count(),

            // ✅ Total unique productlines (handle null or empty)
            'total_productlines' => $connection->table('reject_tbl_list')
                ->select(DB::raw("COALESCE(NULLIF(TRIM(productline), ''), 'No Productline') as productline"))
                ->distinct()
                ->count('productline'),

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

        // Only productlines that are not null or empty
        $productline_totals = DB::table('reject_tbl_list')
            ->whereNotNull('productline')
            ->where('productline', '!=', '')
            ->select('productline', DB::raw('COUNT(*) as total'))
            ->groupBy('productline')
            ->pluck('total', 'productline')
            ->toArray();

        // Status count per productline (for Pie Chart)
        $status_totals = DB::table('reject_tbl_list')
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $summary['productline_totals'] = $productline_totals;
        $summary['status_totals'] = $status_totals;




        return Inertia::render('Dashboard', [
            'summary' => $summary,
        ]);
    }
}
