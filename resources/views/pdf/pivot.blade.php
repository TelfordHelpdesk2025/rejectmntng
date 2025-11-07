<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Pivot Result for {{ $uploaded_date }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        h2 {
            margin: 15px 0 5px;
            color: #333;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        th,
        td {
            border: 1px solid #444;
            padding: 6px;
            text-align: left;
        }

        th {
            background: #f0f0f0;
        }

        .total {
            font-weight: bold;
            background: #e8f0fe;
        }

        .section {
            margin-top: 25px;
        }
    </style>
</head>

<body>
    <!-- <h1>Pivot Result for {{ $uploaded_date }}</h1> -->
    <h1>Pivot Result for {{ \Carbon\Carbon::parse($uploaded_date)->format('m/d/Y') }}</h1>


    @php
    // Group by productline
    $grouped = [];
    foreach ($data as $row) {
    $key = $row->productline && trim($row->productline) !== ''
    ? $row->productline
    : 'No Productline';
    $grouped[$key][] = $row;
    }

    // Compute totals
    $productlineTotals = [];
    $grandTotal = 0;
    foreach ($grouped as $pl => $rows) {
    $total = collect($rows)->sum('total_lots');
    $productlineTotals[$pl] = $total;
    $grandTotal += $total;
    }

    // Separate “No Productline”
    $noPLRows = $grouped['No Productline'] ?? [];
    unset($grouped['No Productline']);
    @endphp

    {{-- 🟡 No Productline Section --}}
    @if (count($noPLRows) > 0)
    <div class="section">
        <h2>No Productline — Total Lots: {{ $productlineTotals['No Productline'] }}</h2>
        <table>
            <thead>
                <tr>
                    <th>Productline</th>
                    <th>Total Lots</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td align="center">—</td>
                    <td align="center">{{ $productlineTotals['No Productline'] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    {{-- 🟢 Productline-wise tables --}}
    @foreach ($grouped as $productline => $rows)
    <div class="section">
        <h2>{{ $productline }} — Total Lots: {{ $productlineTotals[$productline] }}</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Total Lots</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $r)
                <tr>
                    <td>{{ $r->status }}</td>
                    <td align="center">{{ $r->total_lots }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endforeach

    {{-- 🔵 Grand Total Section --}}
    <div class="section">
        <h2>Grand Total Lots</h2>
        <table>
            <thead>
                <tr>
                    <th>Productline</th>
                    <th>Total Lots</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($productlineTotals as $pl => $total)
                <tr>
                    <td>{{ $pl }}</td>
                    <td align="center">{{ $total }}</td>
                </tr>
                @endforeach
                <tr class="total">
                    <td>All Productlines</td>
                    <td align="center">{{ $grandTotal }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>

</html>