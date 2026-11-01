"""
Rutas para consultar las canchas y su disponibilidad.

  GET /api/canchas                                     -> lista de canchas activas
  GET /api/canchas/<id>/disponibilidad?fecha=AAAA-MM-DD -> horarios Libres / Ocupados de ese día
"""
from flask import Blueprint, request

from database import usarBaseDeDatos
from servicios.fechas import convertirTextoAFecha, obtenerNumeroDeDiaDeLaSemana
from servicios.reservas import (
    ESTADO_RESERVA_CANCELADA,
    FIN_DE_TURNO_DE_LA_RESERVA,
    FIN_DE_TURNO_DEL_HORARIO,
)
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
        turnosDelDia = buscarTurnosDelDiaConSuEstado(cursor, idCancha, fechaBuscada)

    turnos = [
        {
            "hora_inicio": turno["hora_inicio"],
            "hora_fin": turno["hora_fin"],
            "precio": turno["precio"],
            "estado": "Ocupada" if turno["esta_ocupado"] else "Libre",
        }
        for turno in turnosDelDia
    ]

    return responderConExito({"cancha_id": idCancha, "fecha": fechaBuscada, "turnos": turnos})


def buscarTurnosDelDiaConSuEstado(cursor, idCancha, fecha):
    """
    Trae los horarios de la cancha para ese día de la semana y, para cada uno,
    si ya hay una reserva (no cancelada) que lo ocupa.
    """
    cursor.execute(
        f"""
        SELECT horarios.hora_inicio, horarios.hora_fin, horarios.precio,
               EXISTS (
                   SELECT 1 FROM reservas
                   WHERE reservas.cancha_id = horarios.cancha_id
                     AND reservas.fecha = %s
                     AND reservas.estado <> %s
                     AND reservas.hora_inicio < {FIN_DE_TURNO_DEL_HORARIO}
                     AND {FIN_DE_TURNO_DE_LA_RESERVA} > horarios.hora_inicio
               ) AS esta_ocupado
        FROM horarios
        WHERE horarios.cancha_id = %s AND horarios.dia_semana = %s AND horarios.activo = TRUE
        ORDER BY horarios.hora_inicio
        """,
        (fecha, ESTADO_RESERVA_CANCELADA, idCancha, obtenerNumeroDeDiaDeLaSemana(fecha)),
    )
    return cursor.fetchall()



