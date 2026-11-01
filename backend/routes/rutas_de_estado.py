
"""
Rutas para chequear que el servidor y la base de datos funcionan.

  GET /api/salud                 -> el servidor está prendido
  GET /api/probar-base-de-datos  -> se conecta a Supabase y lista las tablas
"""
from flask import Blueprint

from database import usarBaseDeDatos
from servicios.respuestas import responderConError, responderConExito

rutasDeEstado = Blueprint("rutasDeEstado", __name__, url_prefix="/api")


@rutasDeEstado.get("/salud")
def verificarQueElServidorFunciona():
    return responderConExito({"estado": "ok"})


@rutasDeEstado.get("/probar-base-de-datos")
def probarConexionALaBaseDeDatos():
    try:
        with usarBaseDeDatos() as cursor:
            cursor.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            )
            nombresDeTablas = [fila["table_name"] for fila in cursor.fetchall()]
        return responderConExito(
            {"conectado": True, "cantidad": len(nombresDeTablas), "tablas": nombresDeTablas}
        )
    except Exception as error:
        return responderConError(f"No se pudo conectar: {error}", codigoHttp=500)
