"""
Rutas de los datos personales del usuario logueado.

  GET /api/mi-perfil   -> devuelve nombre, apellido, email, teléfono y si está completo
  PUT /api/mi-perfil   -> guarda nombre, apellido y teléfono
"""
from flask import Blueprint, g, request

from database import usarBaseDeDatos
from servicios.autenticacion import requiereSesion
from servicios.perfil import (
    ErrorDePerfil,
    convertirAPerfilParaMostrar,
    guardarDatosDelUsuario,
    limpiarYValidarDatos,
)
from servicios.respuestas import responderConError, responderConExito

rutasDePerfil = Blueprint("rutasDePerfil", __name__, url_prefix="/api")


@rutasDePerfil.get("/mi-perfil")
@requiereSesion
def verMiPerfil():
    return responderConExito(convertirAPerfilParaMostrar(g.usuarioActual))


@rutasDePerfil.put("/mi-perfil")
@requiereSesion
def guardarMiPerfil():
    try:
        datosLimpios = limpiarYValidarDatos(request.get_json(silent=True) or {})
    except ErrorDePerfil as error:
        return responderConError(str(error))

    with usarBaseDeDatos() as cursor:
        usuarioActualizado = guardarDatosDelUsuario(cursor, g.usuarioActual["id"], datosLimpios)

    return responderConExito(convertirAPerfilParaMostrar(usuarioActualizado))
