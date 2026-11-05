"""
Reglas de los datos personales del usuario (nombre, apellido, teléfono).
"""
import re

LARGO_MAXIMO_DE_NOMBRE = 60
FORMATO_DE_TELEFONO = re.compile(r"^\+?[0-9 \-]{8,20}$")  # ej: 11 3385-8925 o +54 9 11 3385 8925


class ErrorDePerfil(Exception):
    """Dato mal cargado. El mensaje se le muestra al usuario."""


def tieneElPerfilCompleto(usuario):
    return bool(usuario["nombre"] and usuario["apellido"] and usuario["telefono"])


def limpiarYValidarDatos(datosRecibidos):
    """Saca espacios de más y revisa que los datos tengan sentido. Devuelve los datos limpios."""
    nombre = (datosRecibidos.get("nombre") or "").strip()
    apellido = (datosRecibidos.get("apellido") or "").strip()
    telefono = (datosRecibidos.get("telefono") or "").strip()

    if not nombre or not apellido or not telefono:
        raise ErrorDePerfil("Completá nombre, apellido y teléfono")
    if len(nombre) > LARGO_MAXIMO_DE_NOMBRE or len(apellido) > LARGO_MAXIMO_DE_NOMBRE:
        raise ErrorDePerfil("El nombre o el apellido son demasiado largos")
    if not FORMATO_DE_TELEFONO.match(telefono):
        raise ErrorDePerfil("El teléfono no es válido. Ejemplo: 11 3385-8925")

    return {"nombre": nombre, "apellido": apellido, "telefono": telefono}


def convertirAPerfilParaMostrar(usuario):
    return {
        "id": usuario["id"],
        "nombre": usuario["nombre"],
        "apellido": usuario["apellido"],
        "email": usuario["email"],
        "telefono": usuario["telefono"],
        "perfil_completo": tieneElPerfilCompleto(usuario),
    }


def guardarDatosDelUsuario(cursor, idUsuario, datos):
    cursor.execute(
        """
        UPDATE usuarios SET nombre = %s, apellido = %s, telefono = %s
        WHERE id = %s
        RETURNING id, nombre, apellido, email, telefono
        """,
        (datos["nombre"], datos["apellido"], datos["telefono"], idUsuario),
    )
    return cursor.fetchone()
