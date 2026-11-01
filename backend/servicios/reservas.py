"""
Reglas de negocio de las reservas (lo que se puede y no se puede hacer).
"""
from datetime import time

# Estados posibles de una reserva (columna reservas.estado)
ESTADO_RESERVA_PENDIENTE = "pendiente"
ESTADO_RESERVA_CONFIRMADA = "confirmada"
ESTADO_RESERVA_CANCELADA = "cancelada"

MEDIANOCHE = time(0, 0)

# Un turno que termina a las 00:00 en realidad termina al FINAL del día, no al principio.
# Este pedacito de SQL convierte esas 00:00 en 24:00 para poder comparar horarios bien.
FIN_DE_TURNO_DE_LA_RESERVA = "(CASE WHEN reservas.hora_fin = '00:00' THEN '24:00'::time ELSE reservas.hora_fin END)"
FIN_DE_TURNO_DEL_HORARIO = "(CASE WHEN horarios.hora_fin = '00:00' THEN '24:00'::time ELSE horarios.hora_fin END)"


class ErrorDeReserva(Exception):
    """Error 'esperable' al reservar (ej: el turno ya está ocupado). Se muestra al usuario."""


def esUnRangoDeHorasValido(horaInicio, horaFin):
    """El inicio tiene que ser antes que el fin. Terminar a las 00:00 cuenta como 'fin del día'."""
    return horaFin == MEDIANOCHE or horaInicio < horaFin


def convertirFinDeTurnoParaComparar(horaFin):
    """Devuelve '24:00' si el turno termina a medianoche (PostgreSQL entiende 24:00)."""
    return "24:00" if horaFin == MEDIANOCHE else horaFin.strftime("%H:%M")


def bloquearCanchaMientrasSeReserva(cursor, idCancha):
    """
    Bloquea la fila de la cancha hasta terminar la reserva.
    Así, si dos personas reservan el mismo turno al mismo tiempo,
    la segunda espera y después ve que ya está ocupado.
    """
    cursor.execute("SELECT id FROM canchas WHERE id = %s AND activa = TRUE FOR UPDATE", (idCancha,))
    if cursor.fetchone() is None:
        raise ErrorDeReserva("La cancha no existe o no está activa")


def buscarPrecioDelHorario(cursor, idCancha, numeroDeDia, horaInicio, horaFin):
    cursor.execute(
        """
        SELECT precio FROM horarios
        WHERE cancha_id = %s AND dia_semana = %s
          AND hora_inicio = %s AND hora_fin = %s AND activo = TRUE
        """,
        (idCancha, numeroDeDia, horaInicio, horaFin),
    )
    horario = cursor.fetchone()
    if horario is None:
        raise ErrorDeReserva("Ese horario no existe para esta cancha ese día")
    return horario["precio"]


def verificarQueElTurnoEsteLibre(cursor, idCancha, fecha, horaInicio, horaFin):
    """Busca si ya hay alguna reserva (no cancelada) que se superponga con este turno."""
    cursor.execute(
        f"""
        SELECT 1 FROM reservas
        WHERE reservas.cancha_id = %s AND reservas.fecha = %s AND reservas.estado <> %s
          AND reservas.hora_inicio < %s::time
          AND {FIN_DE_TURNO_DE_LA_RESERVA} > %s::time
        """,
        (idCancha, fecha, ESTADO_RESERVA_CANCELADA, convertirFinDeTurnoParaComparar(horaFin), horaInicio),
    )
    if cursor.fetchone() is not None:
        raise ErrorDeReserva("Ese turno ya está ocupado")


def guardarReservaPendiente(cursor, idUsuario, idCancha, fecha, horaInicio, horaFin, precio):
    cursor.execute(
        """
        INSERT INTO reservas
            (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, estado, precio,
             fecha_creacion, fecha_actualizacion)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id, cancha_id, fecha, hora_inicio, hora_fin, estado, precio
        """,
        (idUsuario, idCancha, fecha, horaInicio, horaFin, ESTADO_RESERVA_PENDIENTE, precio),
    )
    return cursor.fetchone()
