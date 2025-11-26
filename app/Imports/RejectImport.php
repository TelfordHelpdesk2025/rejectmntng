<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RejectImport implements ToCollection
{
    public $duplicateCount = 0;

    public function collection(Collection $rows)
    {
        $user = session('emp_data')['emp_name'] ?? Auth::user()->name ?? 'Unknown User';
        $now = Carbon::now();
        $ip = request()->ip();
        $host = gethostbyaddr($ip);


        foreach ($rows->skip(1) as $row) {

            // LOT ID
            $lotId = trim($row[4]);
            if (empty($lotId)) continue;

            // Existing record
            $existing = DB::table('reject_tbl_list')->where('lot_id', $lotId)->first();

            // 🔥 CORRECT: flat $data array (not nested)
            $data = [
                'fiscal_week' => $row[0],
                'adi_site' => $row[1],
                'subsite' => $row[2],
                'part_name' => $row[3],
                'lot_id' => $row[4],
                'qty' => $row[5],
                'wip_date' => $row[6],
                'start_date' => $row[7],
                'cycle_time' => $row[8],
                'lot_type' => $row[9],
                'station' => $row[10],
                'prod_area' => $row[11],
                'focus_group' => $row[12],
                'process_group' => $row[13],
                'tester' => $row[14],
                'tester_group' => $row[15],
                'uph' => $row[16],
                'package_name' => $row[17],
                'bulk_data' => $row[18],
                'generic_name' => $row[19],
                'part_type' => $row[20],
                'lead_count' => $row[21],
                'lot_status' => $row[22],
                'sldt' => $row[23],
                'mes' => $row[24],
                'stage' => $row[25],
                'part_class' => $row[26],
                'reqd_time' => $row[27],
                'lotentrytime' => $row[28],
                'stage_start_time' => $row[29],
                'CCD' => $row[30],
                'strategy_code' => $row[31],
                'stage_run_days' => $row[32],
                'lot_entry_time_days' => $row[33],
                'handler_group' => $row[34],
                'handler' => $row[35],
                'tray' => $row[36],
                'automotive' => $row[37],
                'stock_position' => $row[38],
                'current_procedure' => $row[39],
                'leadcon' => $row[40],
                'last_evtime' => $row[41],
                'tube_test' => $row[42],
            ];

            if ($existing) {

                // 🔥 Check if anything changed
                $isDifferent = false;
                foreach ($data as $key => $value) {
                    if ($existing->$key != $value) {
                        $isDifferent = true;
                        break;
                    }
                }

                // UPDATE IF DIFFERENT
                if ($isDifferent) {
                    $data['updated_by'] = $user;
                    $data['updated_date'] = $now;
                    $data['uploaded_ip'] = $ip;
                    $data['uploaded_host'] = $host;

                    DB::table('reject_tbl_list')
                        ->where('lot_id', $lotId)
                        ->update($data);
                } else {
                    $this->duplicateCount++;
                }
            } else {

                // INSERT NEW RECORD
                $data['uploaded_by'] = $user;
                $data['uploaded_date'] = $now;
                $data['uploaded_ip'] = $ip;
                $data['uploaded_host'] = $host;

                DB::table('reject_tbl_list')->insert($data);
            }
        }
    }
}
