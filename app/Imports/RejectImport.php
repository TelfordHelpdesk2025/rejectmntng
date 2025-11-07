<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RejectImport implements ToCollection
{
    public function collection(Collection $rows)
    {
        $user = session('emp_data')['emp_name'] ?? Auth::user()->name ?? 'Unknown User';
        $now = Carbon::now();

        foreach ($rows->skip(1) as $row) { // skip header row
            $lotId = trim($row[1]); // Use as unique identifier

            if (empty($lotId)) {
                continue; // skip rows without lot_id
            }

            // Check if record already exists
            $existing = DB::table('reject_tbl_list')
                ->where('lot_id', $lotId)
                ->first();

            if ($existing) {
                // 🔹 Update existing record
                DB::table('reject_tbl_list')
                    ->where('lot_id', $lotId)
                    ->update([
                        'part_name' => $row[0],
                        'qty' => $row[2],
                        'lot_type' => $row[3],
                        'station' => $row[4],
                        'prod_area' => $row[5],
                        'focus_group' => $row[6],
                        'package_name' => $row[7],
                        'lead_count' => $row[8],
                        'lot_status' => $row[9],
                        'sldt' => $row[10],
                        'strategy_code' => $row[11],
                        'stage_run_days' => $row[12],
                        'lot_entry_time_days' => $row[13],
                        'updated_by' => $user,
                        'updated_date' => $now,
                    ]);
            } else {
                // 🔹 Insert new record
                DB::table('reject_tbl_list')->insert([
                    'part_name' => $row[0],
                    'lot_id' => $row[1],
                    'qty' => $row[2],
                    'lot_type' => $row[3],
                    'station' => $row[4],
                    'prod_area' => $row[5],
                    'focus_group' => $row[6],
                    'package_name' => $row[7],
                    'lead_count' => $row[8],
                    'lot_status' => $row[9],
                    'sldt' => $row[10],
                    'strategy_code' => $row[11],
                    'stage_run_days' => $row[12],
                    'lot_entry_time_days' => $row[13],
                    'uploaded_by' => $user,
                    'uploaded_date' => $now,
                ]);
            }
        }
    }
}
