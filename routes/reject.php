<?php

use App\Http\Controllers\Rejects\DataFilterController;
use App\Http\Controllers\Rejects\RejectListController;
use App\Http\Controllers\Rejects\RejectUploadController;
use App\Http\Controllers\Rejects\SummaryExportController;
use Illuminate\Support\Facades\Route;
// ← dapat nasa taas

Route::post('/reject/upload', [RejectUploadController::class, 'uploadExcel'])->name('reject.upload');


Route::get("/reject/index", [RejectListController::class, 'index'])->name('reject.index');

Route::put('/reject/update/{id}', [RejectListController::class, 'update'])
    ->name('reject.update');

Route::post('/reject/import', [RejectUploadController::class, 'import'])->name('reject.import');

Route::get('/reject/pivot', [RejectListController::class, 'pivot'])->name('reject.pivot');
Route::get('/reject/pivot/pdf/{date}', [RejectListController::class, 'pivotPdf'])->name('reject.pivot.pdf');

// routes/web.php
// Route::get('/data/filter', [DataFilterController::class, 'filterPage'])
//     ->name('data.filter');

// Route::get('/data/export', [DataFilterController::class, 'export'])
//     ->name('data.export');

// routes/web.php
Route::get('/reject/data-filter', [DataFilterController::class, 'filterPage'])->name('data.filter');
Route::get('/reject/data-export', [DataFilterController::class, 'export'])->name('reject.data-export');

Route::get('/reject/summary-export', [SummaryExportController::class, 'index'])
    ->name('reject.summary.index');

Route::get('/reject/export-summary/{date}', [SummaryExportController::class, 'exportSummary'])
    ->name('reject.summary.preview'); // for React fetch / optional

Route::get('/reject/export-summary-all/{date}', [SummaryExportController::class, 'exportAll'])
    ->name('reject.summary.exportAll'); // for Excel download

Route::get('/reject/export-pdf/{date}', [SummaryExportController::class, 'exportPdf'])
    ->name('reject.summary.pdf'); // PDF download
