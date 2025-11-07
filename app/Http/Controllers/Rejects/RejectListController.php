<?php

namespace App\Http\Controllers\Rejects;

use App\Http\Controllers\Controller;
use App\Services\DataTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class RejectListController extends Controller
{
    protected $datatable;
    protected $datatable1;

    public function __construct(DataTableService $datatable)
    {
        $this->datatable = $datatable;
    }


    public function index(Request $request)
    {
        $result = $this->datatable->handle(
            $request,
            'mysql',
            'reject_tbl_list',
            [
                'conditions' => function ($query) {
                    return $query->orderBy('id', 'desc');
                },
                'searchColumns' => ['productline', 'part_name', 'lot_id', 'qty', 'package_name', 'lead_count', 'stage_run_days', 'status'],
            ]
        );

        // FOR CSV EXPORTING
        if ($result instanceof \Symfony\Component\HttpFoundation\StreamedResponse) {
            return $result;
        }

        return Inertia::render('Reject/RejectList', [
            'tableData' => $result['data'],
            'tableFilters' => $request->only([
                'search',
                'perPage',
                'sortBy',
                'sortDirection',
                'start',
                'end',
                'dropdownSearchValue',
                'dropdownFields',
            ]),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'productline' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:255',
        ]);

        // 🔹 Add audit fields
        $validated['updated_by'] = session('emp_data')['emp_name'] ?? 'Unknown User';
        $validated['updated_date'] = Carbon::now();

        // 🔹 Perform update
        DB::connection('mysql')->table('reject_tbl_list')
            ->where('id', $id)
            ->update($validated);

        return redirect()->back()->with('success', 'Record updated successfully.');
    }

    public function pivot(Request $request)
    {
        $uploaded_date = $request->get('date');

        $data = DB::table('reject_tbl_list')
            ->select('productline', 'status', DB::raw('COUNT(lot_id) as total_lots'))
            ->whereDate('uploaded_date', $uploaded_date)
            ->groupBy('productline', 'status')
            ->orderBy('productline')
            ->get();

        return inertia('Reject/PivotResult', [
            'data' => $data,
            'uploaded_date' => $uploaded_date
        ]);
    }

    public function pivotPdf($date)
    {
        $data = DB::connection('mysql')
            ->table('reject_tbl_list')
            ->select('productline', 'status', DB::raw('COUNT(lot_id) as total_lots'))
            ->whereDate('uploaded_date', $date)
            ->groupBy('productline', 'status')
            ->get();

        $pdf = Pdf::loadView('pdf.pivot', [
            'data' => $data,
            'uploaded_date' => $date
        ]);

        return $pdf->stream("Pivot_Result_{$date}.pdf"); // view in browser
        // or ->download("Pivot_Result_{$date}.pdf"); // to download
    }
}
