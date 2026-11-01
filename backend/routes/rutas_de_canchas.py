"""
Rutas para consultar las canchas y su disponibilidad.

  GET /api/canchas                                     -> lista de canchas activas
  GET /api/canchas/<id>/disponibilidad?fecha=AAAA-MM-DD -> horarios Libres / Ocupados de ese día
"""
from flask import Blueprint, request

from base_de_datos import usarBaseDeDatos
from servicios.fechas import convertirTextoAFecha, obtenerNumeroDeDiaDeLaSemana
from servicios.reservas import ESTADO_RESERVA_CANCELADA
from servicios.respuestas import responderConError, responderConExito

rutasDeCanchas = Blueprint("rutasDeCanchas", __name__, url_prefix="/api/canchas")


@rutasDeCanchas.get("")
def listarCanchasActivas():
    with usarBaseDeDatos() as cursor:
        cursor.execute(
            """
            SELECT canchas.id, canchas.nombre, canchas.tipo, canchas.capacidad,
                   canchas.precio_base, canchas.descripcion,
                   sedes.nombre AS sede, sedes.direccion
            FROM canchas
            JOIN sedes ON sedes.id = canchas.sede_id
            WHERE canchas.activa = TRUE AND sedes.activa = TRUE
            ORDER BY canchas.id
            """
        )
        canchas = cursor.fetchall()

    return responderConExito(canchas)


@rutasDeCanchas.get("/<int:idCancha>/disponibilidad")
def consultarDisponibilidadDeCancha(idCancha):
    fechaBuscada = convertirTextoAFecha(request.args.get("fecha"))
    if fechaBuscada is None:
        return responderConError("Mandá la fecha así: ?fecha=AAAA-MM-DD")

    with usarBaseDeDatos() as cursor:
        horariosDelDia = buscarHorariosDelDia(cursor, idCancha, fechaBuscada)
        reservasDelDia = buscarReservasDelDia(cursor, idCancha, fechaBuscada)

    turnos = [
        {
            "hora_inicio": horario["hora_inicio"],
            "hora_fin": horario["hora_fin"],
            "precio": horario["precio"],
            "estado": "Ocupada" if estaOcupado(horario, reservasDelDia) else "Libre",
        }
        for horario in horariosDelDia
    ]

    return responderConExito({"cancha_id": idCancha, "fecha": fechaBuscada, "turnos": turnos})


def buscarHorariosDelDia(cursor, idCancha, fecha):
    cursor.execute(
        """
        SELECT hora_inicio, hora_fin, precio
        FROM horarios
        WHERE cancha_id = %s AND dia_semana = %s AND activo = TRUE
        ORDER BY hora_inicio
        """,
        (idCancha, obtenerNumeroDeDiaDeLaSemana(fecha)),
    )
    return cursor.fetchall()


def buscarReservasDelDia(cursor, idCancha, fecha):
    cursor.execute(
        """
        SELECT hora_inicio, hora_fin
        FROM reservas
        WHERE cancha_id = %s AND fecha = %s AND estado <> %s
        """,
        (idCancha, fecha, ESTADO_RESERVA_CANCELADA),
    )
    return cursor.fetchall()


def estaOcupado(horario, reservas):
    """Un horario está ocupado si alguna reserva se superpone con él."""
    return any(
        reserva["hora_inicio"] < horario["hora_fin"] and reserva["hora_fin"] > horario["hora_inicio"]
        for reserva in reservas
    )

