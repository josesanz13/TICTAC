<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJuegosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('juegos', function (Blueprint $table) {
            $table->bigIncrements('Id'); //Integer Unsigned increment
            $table->integer('id_partida');
            $table->integer('turno')->nullable();
            $table->string('jugadoruno')->nullable();
            $table->integer('id_uno')->nullable();
            $table->string('jugadordos')->nullable();
            $table->integer('id_dos')->nullable();
            $table->integer('x')->nullable();
            $table->integer('y')->nullable();
            $table->char('estado',1)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('juegos');
    }
}
