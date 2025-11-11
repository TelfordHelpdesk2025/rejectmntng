<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Export PDF - {{ \Carbon\Carbon::parse($date)->format('m/d/Y') }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        h2 {
            margin-top: 20px;
            color: #fbbf24;

        }

        img {
            display: block;
            margin: 50px 0;
            max-width: 100%;
        }
    </style>
</head>

<body>
    <h1 style="text-align: center; color: #d97706;">Exported Summary Data Date of: {{ \Carbon\Carbon::parse($date)->format('m/d/Y') }}</h1>

    <div style="margin-top: 100px;">
        <h2>Distribution per Product Line</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Productline</th>
                    <th>Total Lots</th>
                </tr>
            </thead>
            <tbody>
                @foreach($distribution as $row)
                <tr>
                    <td>{{ $row->productline }}</td>
                    <td>{{ $row->total_lots }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <img src="{{ $distributionChart }}" alt="Distribution Chart">
    </div>

    <div style="margin-top: 200px;">
        <h2>Breakdown per Product Line per Status</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Productline</th>
                    <th>Status</th>
                    <th>Lot Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($perStatus as $row)
                <tr>
                    <td>{{ $row->productline }}</td>
                    <td>{{ $row->status }}</td>
                    <td>{{ $row->lot_count }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <img src="{{ $perStatusChart }}" alt="Per Status Chart">
    </div>

    <div style="margin-top: 200px;">
        <h2>Number of Lot ID per Stage Run Days</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Bracket</th>
                    <th>Total Lots</th>
                </tr>
            </thead>
            <tbody>
                @foreach($stageDays as $row)
                <tr>
                    <td>{{ $row->bracket }}</td>
                    <td>{{ $row->total_lots }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <img src="{{ $stageChart }}" alt="Stage Chart">
    </div>
</body>

</html>