<?php

namespace App\Http\Controllers\admin;

use App\Models\admin\juego;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class juegoController extends Controller
{
    public function index(){
        return view('admin/juego');
    }

    //24-05-2021 - Jdsm
    //Función para registrar una nueva partida
    public function nuevaPartida(Request $request){
        $id = 0;
        $arr = array();
        $get = DB::table('juegos')
            ->select(DB::raw('id_partida,turno'))
            ->whereRaw("estado IN('A','I','F')")
            ->orderByRaw('id DESC')
            ->limit(1)
            ->get();

        DB::beginTransaction();

        //Si la conulta me arroja data sumo consecutivo de partida para asignar id
        //Sino se da por hecho que es la primera partida. 
        if (count($get) > 0) {
            $id = DB::table('juegos')->insertGetId([
                'id_partida' => $get[0]->id_partida + 1,
                'estado' => 'A',
                'turno' => $get[0]->turno
            ]);
            $arr['id_partida'] = $get[0]->id_partida + 1;
        }else{
            $id = DB::table('juegos')->insertGetId([
                'id_partida' => 1,
                'estado' => 'A'
            ]);
            $arr['id_partida'] = 1;
        }
        $arr['id'] = $id;

        if($id != 0){
            DB::commit();
            $arr['result'] = 1;
            echo json_encode($arr);
        }else{
            DB::rollback();
            $arr['result'] = 0;
            echo json_encode($arr);
        }
    }

    //24-05-2021 - Jdsm
    //Función para iniciar las partidas
    public function iniciarPartida(Request $request){
        DB::beginTransaction();

        $affected = DB::table('juegos')
            ->where('id', $request->_id)
            ->update([
                $request->_tipo => $request->_nombre,
                $request->_sessU => $request->_sess,
                'estado' => $request->_estado
            ]);

        if($affected > 0){
            DB::commit();
            echo json_encode(1);
        }else{
            DB::rollback();
            echo json_encode(0);
        }
    }

    //24-05-2021 - Jdsm
    //Función para obtener el numero siguiente de partida
    public function getPartida(){
        $juego = DB::table('juegos')
            ->select(DB::raw('id_partida'))
            ->whereRaw("estado IN('A','I')")
            ->orderByRaw('id DESC')
            ->limit(1)
            ->get();

        return $juego;
    }

    //24-05-2021 - Jdsm
    // Funcion para consultar el curso de la partida
    public function consultaPartida(Request $request){
        $juego = DB::table('juegos')
            ->select(DB::raw('id_partida,id,estado,jugadordos,jugadoruno,turno'))
            ->whereRaw('estado = ? AND (id = ? OR id_partida = ?)', [$request->_estado,$request->_id,$request->_id])
            ->orderByRaw('id DESC')
            ->limit(1)
            ->get();

        echo json_encode($juego);
    }

    //24-05-2021 - Jdsm
    //Función para fianlizar la partida, sea por un ganador o por totalidad de movimientos.
    public function finalizarPartida(Request $request){
        DB::beginTransaction();

        $affected = DB::table('juegos')
            ->where('id_partida', $request->_id)
            ->update([
                'estado' => 'F'
            ]);

        if($affected > 0){
            DB::commit();
            echo json_encode(1);
        }else{
            DB::rollback();
            echo json_encode(0);
        }
    }

    //24-05-2021 - Jdsm
    //Funcion para obtener la ultima posición jugada en la partida
    public function obtenerUltimaPosicion(Request $request){
        $juego = DB::table('juegos')
            ->select(DB::raw("concat(x,'',y) as pos,x,y,turno,id_uno,id_dos"))
            ->where('id_partida','=',$request->_id)
            ->whereNotNull('x')
            ->whereNotNull('y')
            ->orderByRaw('id DESC')
            ->limit(1)
            ->get();

        echo json_encode($juego);
    }

    //24-05-2021 - Jdsm
    // Función para poder obtener el turno siguiente
    public function asignaTurno(Request $request){
        $juego = DB::table('juegos')
            ->select(DB::raw('turno,id_uno,id_dos,estado'))
            ->whereRaw("estado IN('I','F') AND id_partida = ?",[$request->_id])
            ->orderByRaw('id DESC')
            ->limit(1)
            ->get();
        
        echo json_encode($juego);
    }

    //24-05-2021 - Jdsm
    // Función para asignar la posicion seleccionada por el jugador
    public function asignarPosicion(Request $request){
        DB::beginTransaction();

        $juego = DB::table('juegos')
            ->select('id_uno','id_dos')
            ->where('id_partida','=',$request->_id)
            ->limit(1)
            ->get();

        $affected = DB::table('juegos')->insert([
            'id_partida' => $request->_id,
            'turno' => $request->_turno,
            'x' => $request->_x,
            'y' => $request->_y,
            'id_uno' => $juego[0]->id_uno,
            'id_dos' => $juego[0]->id_dos,
            'estado' => 'I',
        ]);

        if($affected > 0){
            DB::commit();
            echo json_encode(1);
        }else{
            DB::rollback();
            echo json_encode(0);
        }
    }
}
