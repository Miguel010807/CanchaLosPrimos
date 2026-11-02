"""
Rutas para crear reservas y ver "Mis Turnos".
Todas tienen candado: solo funcionan con la sesión iniciada.

  POST /api/reservas                  -> crea una reserva en estado Pendiente
  POST /api/reservas/<id>/cancelar    -> cancela una reserva propia
  GET  /api/mis-reservas              -> lista de turnos del usuario (Mis Turnos)

El usuario NO viene en el pedido: sale de la sesión (g.usuarioActual),
así nadie puede reservar, cancelar ni ver turnos a nombre de otro.
"""
from flask import Blueprint, g, request

from database import usarBaseDeDatos
from servicios.autenticacion import requiereSesion
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
@requiereSesion
def crearReserva():
    datosRecibidos = request.get_json(silent=True) or {}

    idUsuario = g.usuarioActual["id"]
    idCancha = datosRecibidos.get("cancha_id")
    fecha = convertirTextoAFecha(datosRecibidos.get("fecha"))
    horaInicio = convertirTextoAHora(datosRecibidos.get("hora_inicio"))
    horaFin = convertirTextoAHora(datosRecibidos.get("hora_fin"))

    if not all([idCancha, fecha, horaInicio, horaFin]):
        return responderConError(
            "Faltan datos. Mandá: cancha_id, fecha (AAAA-MM-DD), hora_inicio y hora_fin (HH:MM)"
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
@requiereSesion
def cancelarReserva(idReserva):
    datosRecibidos = request.get_json(silent=True) or {}
    motivo = datosRecibidos.get("motivo")  # opcional

    try:
        with usarBaseDeDatos() as cursor:
            reserva = buscarReservaDelUsuario(cursor, idReserva, g.usuarioActual["id"])
            verificarQueSePuedaCancelar(reserva)
            reservaCancelada = marcarReservaComoCancelada(cursor, idReserva, motivo)
    except ErrorDeReserva as error:
        return responderConError(str(error), codigoHttp=409)

    return responderConExito(reservaCancelada)


@rutasDeReservas.get("/mis-reservas")
@requiereSesion
def listarMisTurnos():
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
            (g.usuarioActual["id"],),
        )
        misTurnos = cursor.fetchall()

    return responderConExito(misTurnos)
