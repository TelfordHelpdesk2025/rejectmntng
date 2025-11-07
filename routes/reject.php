<?php

use App\Http\Controllers\Rejects\RejectListController;
use App\Http\Controllers\Rejects\RejectUploadController;
use Illuminate\Support\Facades\Route;
// ← dapat nasa taas

Route::post('/reject/upload', [RejectUploadController::class, 'uploadExcel'])->name('reject.upload');


Route::get("/reject/index", [RejectListController::class, 'index'])->name('reject.index');

Route::put('/reject/update/{id}', [RejectListController::class, 'update'])
    ->name('reject.update');

Route::post('/reject/import', [RejectUploadController::class, 'import'])->name('reject.import');

Route::get('/reject/pivot', [RejectListController::class, 'pivot'])->name('reject.pivot');
Route::get('/reject/pivot/pdf/{date}', [RejectListController::class, 'pivotPdf'])->name('reject.pivot.pdf');
