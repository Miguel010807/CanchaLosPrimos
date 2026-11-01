"""
Rutas para crear reservas y ver "Mis Turnos".

  POST /api/reservas                     -> crea una reserva en estado Pendiente
  GET  /api/usuarios/<id>/reservas       -> lista de turnos del usuario (Mis Turnos)
  POST /api/reservas/<id>/cancelar       -> cancela una reserva del usuario

IMPORTANTE (temporal): por ahora el id del usuario viene en el pedido.
Cuando hagamos el login, lo vamos a sacar del token de sesión,
así nadie puede reservar o ver turnos a nombre de otro.
"""
from flask import Blueprint, request

from database import usarBaseDeDatos
from servicios.fechas import (
    convertirTextoAFecha,
    convertirTextoAHora,
    esUnaFechaPasada,
    obtenerNumeroDeDiaDeLaSemana,
)
from servicios.reservas import (
    ErrorDeReserva,
    bloquearCanchaMientrasSeReserva,
    buscarPrecioDelHorario,
    buscarReservaDelUsuario,
    esUnRangoDeHorasValido,
    guardarReservaPendiente,
    marcarReservaComoCancelada,
    verificarQueElTurnoEsteLibre,
    verificarQueSePuedaCancelar,
)
from servicios.respuestas import responderConError, responderConExito

rutasDeReservas = Blueprint("rutasDeReservas", __name__, url_prefix="/api")


@rutasDeReservas.post("/reservas")
def crearReserva():
    datosRecibidos = request.get_json(silent=True) or {}

    idUsuario = datosRecibidos.get("usuario_id")
    idCancha = datosRecibidos.get("cancha_id")
    fecha = convertirTextoAFecha(datosRecibidos.get("fecha"))
    horaInicio = convertirTextoAHora(datosRecibidos.get("hora_inicio"))
    horaFin = convertirTextoAHora(datosRecibidos.get("hora_fin"))

    if not all([idUsuario, idCancha, fecha, horaInicio, horaFin]):
        return responderConError(
            "Faltan datos. Mandá: usuario_id, cancha_id, fecha (AAAA-MM-DD), hora_inicio y hora_fin (HH:MM)"
        )
    if esUnaFechaPasada(fecha):
        return responderConError("No se puede reservar en una fecha que ya pasó")
    if not esUnRangoDeHorasValido(horaInicio, horaFin):
        return responderConError("La hora de inicio tiene que ser antes que la de fin")

    try:
        with usarBaseDeDatos() as cursor:
            bloquearCanchaMientrasSeReserva(cursor, idCancha)
            precio = buscarPrecioDelHorario(
                cursor, idCancha, obtenerNumeroDeDiaDeLaSemana(fecha), horaInicio, horaFin
            )
            verificarQueElTurnoEsteLibre(cursor, idCancha, fecha, horaInicio, horaFin)
            reservaNueva = guardarReservaPendiente(
                cursor, idUsuario, idCancha, fecha, horaInicio, horaFin, precio
            )
    except ErrorDeReserva as error:
        return responderConError(str(error), codigoHttp=409)

    return responderConExito(reservaNueva, codigoHttp=201)

@rutasDeReservas.post("/reservas/<int:idReserva>/cancelar")
def cancelarReserva(idReserva):
    datosRecibidos = request.get_json(silent=True) or {}

    idUsuario = datosRecibidos.get("usuario_id")
    motivo = datosRecibidos.get("motivo")  # opcional

    if not idUsuario:
        return responderConError("Falta el usuario_id")

    try:
        with usarBaseDeDatos() as cursor:
            reserva = buscarReservaDelUsuario(cursor, idReserva, idUsuario)
            verificarQueSePuedaCancelar(reserva)
            reservaCancelada = marcarReservaComoCancelada(cursor, idReserva, motivo)
    except ErrorDeReserva as error:
        return responderConError(str(error), codigoHttp=409)

    return responderConExito(reservaCancelada)


@rutasDeReservas.get("/usuarios/<int:idUsuario>/reservas")
def listarMisTurnos(idUsuario):
    with usarBaseDeDatos() as cursor:
        cursor.execute(
            """
            SELECT reservas.id, reservas.fecha, reservas.hora_inicio, reservas.hora_fin,
                   reservas.estado, reservas.precio, canchas.nombre AS cancha
            FROM reservas
            JOIN canchas ON canchas.id = reservas.cancha_id
            WHERE reservas.usuario_id = %s
            ORDER BY reservas.fecha DESC, reservas.hora_inicio DESC
            """,
            (idUsuario,),
        )
        misTurnos = cursor.fetchall()

    return responderConExito(misTurnos)
