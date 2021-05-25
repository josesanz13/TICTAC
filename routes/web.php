<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\juegoController;

//RUTAS GET
Route::get('/', [juegoController::class, 'index']);
Route::get('getPartida', [juegoController::class, 'getPartida'])->name('getPartida');
Route::get('nuevaPartida', [juegoController::class, 'nuevaPartida'])->name('nuevaPartida');

//RUTAS POST
Route::post('consultaPartida', [juegoController::class, 'consultaPartida'])->name('consultaPartida');
Route::post('iniciarPartida', [juegoController::class, 'iniciarPartida'])->name('iniciarPartida');
Route::post('finalizarPartida', [juegoController::class, 'finalizarPartida'])->name('finalizarPartida');
Route::post('asignaTurno', [juegoController::class, 'asignaTurno'])->name('asignaTurno');
Route::post('asignarPosicion', [juegoController::class, 'asignarPosicion'])->name('asignarPosicion');
Route::post('obtenerUltimaPosicion', [juegoController::class, 'obtenerUltimaPosicion'])->name('obtenerUltimaPosicion');
