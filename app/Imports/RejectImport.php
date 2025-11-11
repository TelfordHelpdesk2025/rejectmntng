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

        $duplicateCount = 0;

        foreach ($rows->skip(1) as $row) {
            $lotId = trim($row[1]);

            if (empty($lotId)) continue;

            $existing = DB::table('reject_tbl_list')->where('lot_id', $lotId)->first();

            $data = [
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
            ];

            if ($existing) {
                $isDifferent = false;
                foreach ($data as $key => $value) {
                    if ($existing->$key != $value) {
                        $isDifferent = true;
                        break;
                    }
                }

                if ($isDifferent) {
                    $data['updated_by'] = $user;
                    $data['updated_date'] = $now;
                    DB::table('reject_tbl_list')->where('lot_id', $lotId)->update($data);
                } else {
                    $duplicateCount++; // ❗ Count duplicate rows that are exactly the same
                }
            } else {
                $data['lot_id'] = $lotId;
                $data['uploaded_by'] = $user;
                $data['uploaded_date'] = $now;
                DB::table('reject_tbl_list')->insert($data);
            }
        }

        // Optional: return count to frontend
        return $duplicateCount;
    }
}
