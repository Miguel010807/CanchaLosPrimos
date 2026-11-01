"""
Funciones de ayuda para responder siempre con el mismo formato JSON.
"""
from datetime import date, datetime, time
from decimal import Decimal

from flask import jsonify


def convertirAFormatoJson(valor):
    """Pasa fechas, horas y decimales de la base a texto/números que entiende el frontend."""
    if isinstance(valor, (datetime, date)):
        return valor.isoformat()
    if isinstance(valor, time):
        return valor.strftime("%H:%M")
    if isinstance(valor, Decimal):
        return float(valor)
    if isinstance(valor, dict):
        return {clave: convertirAFormatoJson(dato) for clave, dato in valor.items()}
    if isinstance(valor, list):
        return [convertirAFormatoJson(dato) for dato in valor]
    return valor


def responderConExito(datos, codigoHttp=200):
    return jsonify(convertirAFormatoJson(datos)), codigoHttp


def responderConError(mensaje, codigoHttp=400):
    return jsonify({"error": mensaje}), codigoHttp
