<?php

namespace App\Http\Controllers\Rejects;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use GuzzleHttp\Client;

class SummaryExportController extends Controller
{
    // Show the React page
    public function index()
    {
        $dates = DB::connection('mysql')->table('reject_tbl_list')
            ->select(DB::raw('DISTINCT DATE(updated_date) as updated_date'))
            ->whereNotNull('updated_date')
            ->orderBy('updated_date', 'desc')
            ->pluck('updated_date');

        return inertia('Reject/SummaryExport', [
            'title' => 'Summary Data Export',
            'availableDates' => $dates,
        ]);
    }

    // Fetch summary data for React preview
    public function exportSummary($date)
    {
        $distribution = DB::connection('mysql')->table('reject_tbl_list')
            ->select('productline', DB::raw('COUNT(DISTINCT lot_id) as total_lots'))
            ->whereDate('updated_date', $date)
            ->whereNotNull('productline')
            ->groupBy('productline')
            ->get();

        $perStatus = DB::connection('mysql')->table('reject_tbl_list')
            ->select('productline', 'status', DB::raw('COUNT(DISTINCT lot_id) as lot_count'))
            ->whereDate('updated_date', $date)
            ->whereNotNull('status') // exclude null values
            ->groupBy('productline', 'status')
            ->get();

        $stageDays = DB::connection('mysql')->table('reject_tbl_list')
            ->select(
                DB::raw("
                    CASE 
                        WHEN stage_run_days >= 101 THEN '101 & above'
                        WHEN stage_run_days BETWEEN 51 AND 100 THEN '51 to 100 days'
                        WHEN stage_run_days BETWEEN 31 AND 50 THEN '31 to 50 days'
                        WHEN stage_run_days BETWEEN 15 AND 30 THEN '15 to 30 days'
                        WHEN stage_run_days BETWEEN 1 AND 14 THEN '1 – 14 days'
                        ELSE '0 Day'
                    END as bracket
                "),
                DB::raw('COUNT(DISTINCT lot_id) as total_lots')
            )
            ->whereDate('updated_date', $date)
            ->groupBy('bracket')
            ->orderByRaw("
                CASE 
                    WHEN bracket = '0 Day' THEN 0
                    WHEN bracket = '1 – 14 days' THEN 1
                    WHEN bracket = '15 to 30 days' THEN 2
                    WHEN bracket = '31 to 50 days' THEN 3
                    WHEN bracket = '51 to 100 days' THEN 4
                    WHEN bracket = '101 & above' THEN 5
                END
            ")
            ->get();

        return response()->json([
            'distribution' => $distribution,
            'per_status' => $perStatus,
            'stage_days' => $stageDays,
        ]);
    }

    // Helper: Generate chart image using QuickChart
    private function generateChartImage($labels, $values, $title)
    {
        $chart = [
            'type' => 'bar',
            'data' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => $title,
                        'data' => $values,
                        'backgroundColor' => 'rgba(59, 130, 246, 0.7)',
                    ]
                ]
            ],
            'options' => [
                'plugins' => [
                    'legend' => ['display' => false],
                    'title' => ['display' => true, 'text' => $title]
                ]
            ]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($chart));
    }

    // Helper: Generate stacked chart for perStatus
    private function generatePerStatusChart($perStatus)
    {
        $productlines = array_unique(array_column($perStatus, 'productline'));
        $statuses = array_unique(array_column($perStatus, 'status'));

        $datasets = [];
        foreach ($statuses as $status) {
            $data = [];
            foreach ($productlines as $pl) {
                $found = array_filter($perStatus, fn($row) => $row->productline === $pl && $row->status === $status);
                $data[] = $found ? array_values($found)[0]->lot_count : 0;
            }
            $datasets[] = [
                'label' => $status,
                'data' => $data,
                'backgroundColor' => $this->getRandomColor(),
            ];
        }

        $chart = [
            'type' => 'bar',
            'data' => [
                'labels' => $productlines,
                'datasets' => $datasets
            ],
            'options' => [
                'plugins' => [
                    'title' => ['display' => true, 'text' => 'Breakdown per Product Line per Status']
                ],
                'responsive' => true,
                'scales' => [
                    'x' => ['stacked' => true],
                    'y' => ['stacked' => true]
                ]
            ]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($chart));
    }

    // Helper: random colors for stacked chart
    private function getRandomColor()
    {
        $colors = ['#3b82f6', '#9333ea', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#8b5cf6', '#14b8a6'];
        return $colors[array_rand($colors)];
    }

    // Export PDF with charts
    public function exportPdf($date)
    {
        $distribution = DB::connection('mysql')->table('reject_tbl_list')
            ->select('productline', DB::raw('COUNT(DISTINCT lot_id) as total_lots'))
            ->whereDate('updated_date', $date)
            ->whereNotNull('productline')
            ->groupBy('productline')
            ->get()->toArray();

        $perStatus = DB::connection('mysql')->table('reject_tbl_list')
            ->select('productline', 'status', DB::raw('COUNT(DISTINCT lot_id) as lot_count'))
            ->whereDate('updated_date', $date)
            ->whereNotNull('status') // exclude null values
            ->groupBy('productline', 'status')
            ->orderByDesc(DB::raw('COUNT(DISTINCT lot_id)')) // order from highest to lowest
            ->get()
            ->toArray();


        $stageDays = DB::connection('mysql')->table('reject_tbl_list')
            ->select(
                DB::raw("
                    CASE 
                        WHEN stage_run_days >= 101 THEN '101 & above'
                        WHEN stage_run_days BETWEEN 51 AND 100 THEN '51 to 100 days'
                        WHEN stage_run_days BETWEEN 31 AND 50 THEN '31 to 50 days'
                        WHEN stage_run_days BETWEEN 15 AND 30 THEN '15 to 30 days'
                        WHEN stage_run_days BETWEEN 1 AND 14 THEN '1 – 14 days'
                        ELSE '0 Day'
                    END as bracket
                "),
                DB::raw('COUNT(DISTINCT lot_id) as total_lots')
            )
            ->whereDate('updated_date', $date)
            ->groupBy('bracket')
            ->orderByRaw("
                CASE 
                    WHEN bracket = '0 Day' THEN 0
                    WHEN bracket = '1 – 14 days' THEN 1
                    WHEN bracket = '15 to 30 days' THEN 2
                    WHEN bracket = '31 to 50 days' THEN 3
                    WHEN bracket = '51 to 100 days' THEN 4
                    WHEN bracket = '101 & above' THEN 5
                END
            ")
            ->get()->toArray();

        // Generate chart URLs
        $distributionChart = $this->generateChartImage(
            array_column($distribution, 'productline'),
            array_column($distribution, 'total_lots'),
            'Distribution per Product Line'
        );

        $stageChart = $this->generateChartImage(
            array_column($stageDays, 'bracket'),
            array_column($stageDays, 'total_lots'),
            'Lot Count per Stage Days'
        );

        $perStatusChart = $this->generatePerStatusChart($perStatus);

        $pdf = Pdf::loadView('pdf/summary', [
            'distribution' => $distribution,
            'perStatus' => $perStatus,
            'stageDays' => $stageDays,
            'distributionChart' => $distributionChart,
            'stageChart' => $stageChart,
            'perStatusChart' => $perStatusChart,
            'date' => $date,
        ])->setOptions([
            'isRemoteEnabled' => true,
        ]);

        return $pdf->stream("summary_{$date}.pdf");
    }
}
