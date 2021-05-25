

//Declaro variable globales necesarias para validaciones
//Creo 2 variables de sesión para asignar un identificador unico aleatorio para cada jugador
sessionStorage.setItem("session",Math.floor((Math.random() * (10000 - 0 + 1)) + 0));
sessionStorage.setItem("inicio",false);

var session = parseInt(sessionStorage.getItem("session"));
var inicio  = sessionStorage.getItem("inicio");
jugador1    = "Jugador 1",
jugador2    = "Jugador 2",
check       = 0,
turno       = 0,
cont        = 0,
estadoJuego = false,
$IDpartida  = null,
$Gid        = null,
arr = [
	['','',''],
	['','',''],
	['','','']
];

(function () {
	//Función para cuando el DOM ya está cargado
	document.addEventListener('DOMContentLoaded', function (e) {
		//Inicio y pongo clase para indicar que no hay juego aun hasta validar data de usuarios
		$(".pst").not('.activado').addClass('finalizado');

		//Evento para el botn de nueva partida
		$("#btnNP").on("click", function (e) {
			e.preventDefault();
			$("#btnUP").prop("disabled", true);
			$(".users").removeClass('d-none');
			setTimeout(function () { $("#txtJugador1").focus() }, 0);
			$.ajax({
				url: base_url+'/nuevaPartida',
				type: 'GET',
				success: function (data) {
					try {
						data = JSON.parse(data);
						if (data.result == 1) {
							$IDpartida = data.id_partida;
							$Gid = data.id;
							$(".idP").empty().text("ID de partida : " + $IDpartida);
						} else {
							alert("Error... Comuniquese con el administrador del sistema.");
						}
					} catch (error) {
						console.log("Error :", error);
					}
				}
			});
		});

		//Evento para el boton de unirse a una partida  
		$("#btnUP").on("click", function (e) {
			e.preventDefault();
			$(".idPartida").removeClass('d-none');
			setTimeout(function () { $("#txtId").focus() }, 50);
		})

		//Evento para boton de validación numero de partida 
		$("#btnUPID").on("click", function (e) {
			e.preventDefault();
			if ($("#txtId").val() != '') {
				$.ajax({
					url: base_url+'/consultaPartida',
					type: 'POST',
					headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
					data: {
						_id: parseInt($("#txtId").val()),
						_estado: 'A'
					},
					success: function (data) {
						try {
							data = JSON.parse(data);
							if (!data.length > 0) {
								alert("ID no encontrado, porfavor verifica.");
								return false;
							} else {
								$Gid = data[0].id;
								$IDpartida = data[0].id_partida;
								$(".users").removeClass('d-none');
								$("#txtJugador1").val(data[0].jugadoruno);
								$("#txtJugador1, #btnJugador1, #txtId, #btnUPID").prop("disabled", true);
								$("#txtJugador2, #btnJugador2").prop("disabled", false);
								setTimeout(function () { $("#txtJugador2").focus() }, 50);
							}

						} catch (error) {
							console.log("Error :", error);
						}
					}
				});
			} else {
				alert("Debes de ingresar un numero de ID de partida.");
			}
		});

		//Evento para reiniciar partida
		$("#btnRP").on("click",function(e){
			e.preventDefault();
			$("#frmTicTac").trigger("reset");
			$(".idPartida, .users, .eat").addClass('d-none');
			$(".idP").text("ID de partida : ");
			$(".jugador").text("");
			$("#btnNP, #btnUP, #btnUPID, #btnJugador1, #btnJugador2").prop("disabled",false);
			sessionStorage.setItem("session",Math.floor((Math.random() * (10000 - 0 + 1)) + 0));
			$(".pst").find('.pane').removeClass('equis circulo')
			$(".pst").removeClass('uno dos activado');
			$(this).addClass('d-none');
		});

		//Evento para boton guardar del jugador uno
		$("#btnJugador1").on("click", function (e) {
			e.preventDefault();
			sessionStorage.setItem("opcion", "X");
			if ($("#txtJugador1").val() != '') jugador1 = $("#txtJugador1").val();

			$.ajax({
				url: base_url+'/iniciarPartida',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				data: {
					_tipo: 'jugadoruno',
					_nombre: jugador1,
					_estado: 'A',
					_id: $Gid,
					_sess: session,
					_sessU: 'id_uno'
				},
				success: function (data) {
					data = JSON.parse(data);
					if (data == 1) {
						$("#txtJugador1,#btnNP").val(jugador1).prop("disabled", true);
						$("#btnJugador1").prop("disabled", true);
						bucle();
					} else {
						alert("Error... Comuniquese con el administrador del sistema.");
					}
				}
			});
		});

		//Evento para boton guardar del jugador dos
		$("#btnJugador2").on("click", function (e) {
			e.preventDefault();
			sessionStorage.setItem("opcion", "O");
			if ($("#txtJugador2").val() != '') jugador2 = $("#txtJugador2").val();

			$.ajax({
				url: base_url+'/iniciarPartida',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				data: {
					_tipo: 'jugadordos',
					_nombre: jugador2,
					_estado: 'I',
					_id: $Gid,
					_sess: session,
					_sessU: 'id_dos'
				},
				success: function (data) {
					data = JSON.parse(data);
					if (data == 1) {
						$("#txtJugador2, #btnNP, #btnUP").val(jugador2).prop("disabled", true);
						$("#btnJugador2").prop("disabled", true);
						bucle();
					} else {
						alert("Error... Comuniquese con el administrador del sistema.");
					}
				}
			});
		});

		//Evento click en la tabla
		$(document).on("click", ".pst", function (e) {
			e.preventDefault();
			if (!$(this).hasClass('activado') && !$(this).hasClass('finalizado')) {
				$(this).addClass("activado");
				var juego = turno == 0 ? 'X' : 'O';
				turno == 0 ? $(this).find('.pane').addClass("equis") : $(this).find('.pane').addClass("circulo");
				turno == 0 ? $(this).addClass("uno") : $(this).addClass("dos");

				if (validaJuego(juego, parseInt($(this).parent().index()), parseInt($(this).index()))) {
					asignarPosicion(parseInt($(this).parent().index()), parseInt($(this).index()), 'F');
					$(".eat").text("¡El juego ha terminado!").removeClass('d-none');
					$(".pst").not('.activado').addClass('finalizado');
					finalizarPartida();
				} else {
					$(".pst").not('.activado').addClass('finalizado');
					asignarPosicion(parseInt($(this).parent().index()), parseInt($(this).index()));
					turno == 0 ? turno++ : turno--;
					cont++;
				}

				if (cont == 9) {
					$(".eat").text("¡El juego ha terminado!").removeClass('d-none');
					finalizarPartida();
				}
			}
		});

		//Función para validar juego
		function validaJuego(check, index, pos) {
			arr[index][pos] = check;

			// Probabilidades
			if (arr[0][0] == check && arr[0][1] == check && arr[0][2] == check) {
				return true;
			}
			if (arr[1][0] == check && arr[1][1] == check && arr[1][2] == check) {
				return true;
			}
			if (arr[2][0] == check && arr[2][1] == check && arr[2][2] == check) {
				return true;
			}
			if (arr[0][0] == check && arr[1][0] == check && arr[2][0] == check) {
				return true;
			}
			if (arr[0][1] == check && arr[1][1] == check && arr[2][1] == check) {
				return true;
			}
			if (arr[0][2] == check && arr[1][2] == check && arr[2][2] == check) {
				return true;
			}
			if (arr[0][0] == check && arr[1][1] == check && arr[2][2] == check) {
				return true;
			}
			if (arr[0][2] == check && arr[1][1] == check && arr[2][0] == check) {
				return true;
			}

			return false;
		}

		// Funcion para asignar las posiciones indicadas por el usuario
		function asignarPosicion(index, pos, estado) {
			$.ajax({
				url: base_url+'/asignarPosicion',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				assync: false,
				data: {
					_turno: turno,
					_x: index,
					_y: pos,
					_id: $IDpartida
				},
				success: function (data) {
					if (!estado == 'F') asignaTurno()
				}
			});
		}

		//Funcion para obtener y pintar la ultima posición asignada
		function obtenerUltimaPosicion() {
			$.ajax({
				url: base_url+'/obtenerUltimaPosicion',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				assync: false,
				data: {
					_id: $IDpartida
				},
				success: function (data) {
					try {
						data = JSON.parse(data);
						if (data.length > 0) {
							var posicion 	= data[0].pos;
							var juego 		= parseInt(data[0].turno) == 0 ? 'X' : 'O';
							var idVerifica 	= parseInt((turno == 0 ? data[0].id_uno : data[0].id_dos));

							$("[data-pos=" + posicion + "]").addClass('activado ' + (parseInt(data[0].turno) == 0 ? 'uno' : 'dos') + ' ').removeClass('finalizado');
							$("[data-pos=" + posicion + "]").find('.pane').addClass((parseInt(data[0].turno) == 0 ? 'equis' : 'circulo'));
							$(".pst").addClass('finalizado');

							if (session == idVerifica && !validaJuego(juego, parseInt(data[0].x), parseInt(data[0].y))) {
								$(".pst").removeClass('finalizado');
							}

							if (validaJuego(juego, parseInt(data[0].x), parseInt(data[0].y))) {
								$(".eat").html("¡El juego ha terminado! <strong> Ganador : " + (turno == 0 ? jugador1 : jugador2) + "</strong> ").removeClass('d-none');
								$(".pst").not('.activado').addClass('finalizado');
								$("#btnRP").removeClass('d-none');
							}
						}
					} catch (error) {
						alert("¡Error! comuniquese con el administrador del sistema.")
					}
				}
			});
		}

		//Función para validar el estado de la partida
		function validaEstado(tipo = null) {
			$.ajax({
				url: base_url+'/consultaPartida',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				data: {
					_id: $IDpartida,
					_estado: 'F'
				},
				assync: false,
				success: function (data) {
					try {
						data = JSON.parse(data);
						if (data.length > 0) {
							estadoJuego = true;
							obtenerUltimaPosicion();
						} else {
							tipo == 'b' ? setTimeout("bucle();", 3000) : setTimeout("asignaTurno();", 5000);
						}
					} catch (error) {
						console.log("Error : ",error);
					}
				}
			});
		}

		//Función para finalizar la partida
		function finalizarPartida() {
			console.log("Funcion Finalizar ......");
			$.ajax({
				url: base_url+'/finalizarPartida',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				data: {
					_id: $IDpartida
				},
				assync: false,
				success: function (data) {
					data = JSON.parse(data);
					if (data == 1) validaEstado()
				}
			});
		}

		//Función en ciclo, escuchador para validar que esten 2 usuarios en la partida para iniciar
		bucle = function () {
			$.ajax({
				url: base_url+'/consultaPartida',
				type: 'POST',
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				data: {
					_id: $Gid,
					_estado: 'I'
				},
				assync: false,
				success: function (data) {
					try {
						data = JSON.parse(data);
						if (data.length == 0) {
							validaEstado('b');
						} else {
							$("#txtJugador1").val(data[0].jugadoruno).prop("disabled", true);
							$("#txtJugador2").val(data[0].jugadordos).prop("disabled", true);
							$("#btnJugador1, #btnJugador2").prop("disabled", true);
							$(".idP").text("ID de partida : " + data[0].id_partida);
							jugador1 = data[0].jugadoruno;
							jugador2 = data[0].jugadordos;
							asignaTurno();
						}
					} catch (error) {
						console.log("Error : ",error);
					}
				}
			});
		}

		//Función en ciclo, escuchador para validar de quien es el siguiente turno
		asignaTurno = function () {
			$.ajax({
				url: base_url+'/asignaTurno',
				type: 'POST',
				assync: false,
				headers : {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				data: {
					_id: $IDpartida
				},
				success: function (data) {
					try {
						validaEstado();
						data = JSON.parse(data);
						if (data.length > 0) {
							if (data[0].estado == 'I') {
								turno = data[0].turno == null ? 1 : data[0].turno;
								obtenerUltimaPosicion();
								turno == 0 ? turno++ : turno--;
								$(".jugador").empty();
								turno == 0 ? $(".jugador").text("Turno para : " + jugador1) : $(".jugador").text("Turno para : " + jugador2);
								if (inicio == "false") {
									var idVerifica = parseInt((turno == 0 ? data[0].id_uno : data[0].id_dos));
									if (session == idVerifica) {
										$(".pst").removeClass('finalizado');
									}
									sessionStorage.setItem("inicio", true);
								}
							} else if (data[0].estado == 'F') {
								obtenerUltimaPosicion();
							}
						}
					} catch (error) {
						console.log("Error : ",error);
					}
				}
			});
		}
	})
})();