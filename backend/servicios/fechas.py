"""
Funciones de ayuda para trabajar con fechas y horas.
"""
from datetime import date, datetime


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
    return fecha < date.today()

