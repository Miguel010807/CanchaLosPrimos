"""
Funciones de ayuda para trabajar con fechas y horas.

Todas las comparaciones con "ahora" usan la hora de Argentina,
porque el servidor (por ejemplo en Railway) puede estar en otro país.
"""
from datetime import date, datetime
from zoneinfo import ZoneInfo

ZONA_HORARIA_DE_ARGENTINA = ZoneInfo("America/Argentina/Buenos_Aires")


def obtenerAhoraEnArgentina():
    return datetime.now(ZONA_HORARIA_DE_ARGENTINA)


def convertirTextoAFecha(textoFecha):
    """Convierte '2026-11-15' en una fecha. Devuelve None si el texto no es válido."""
    try:
        return datetime.strptime(textoFecha, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def convertirTextoAHora(textoHora):
    """Convierte '20:00' en una hora. Devuelve None si el texto no es válido."""
    try:
        return datetime.strptime(textoHora, "%H:%M").time()
    except (TypeError, ValueError):
        return None


def obtenerNumeroDeDiaDeLaSemana(fecha: date):
    """Devuelve el día como está guardado en la tabla horarios: 1 = lunes ... 7 = domingo."""
    return fecha.isoweekday()


def esUnaFechaPasada(fecha: date):
    return fecha < obtenerAhoraEnArgentina().date()


def yaEmpezoElTurno(fecha: date, horaInicio):
    """True si el turno es de un día anterior, o es de hoy y su hora de inicio ya llegó."""
    ahora = obtenerAhoraEnArgentina()
    if fecha != ahora.date():
        return fecha < ahora.date()
    return horaInicio <= ahora.time().replace(tzinfo=None)
