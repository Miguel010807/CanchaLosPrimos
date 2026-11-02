"""
Candado de las rutas privadas (reservar, cancelar, Mis turnos).

Cómo funciona:
  1. El frontend manda el token de la sesión en el encabezado:
         Authorization: Bearer <token>
  2. Le preguntamos a Supabase Auth si ese token es válido y de quién es.
  3. Buscamos a esa persona en nuestra tabla "usuarios" (si es nueva, la creamos).
  4. La ruta recibe el usuario en  g.usuarioActual
"""
import json
import urllib.error
import urllib.request
from functools import wraps

from flask import g, request

from config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL
from database import usarBaseDeDatos
from servicios.respuestas import responderConError


def requiereSesion(rutaOriginal):
    """Decorador: ponelo arriba de una ruta para que solo entren usuarios logueados."""

    @wraps(rutaOriginal)
    def rutaConCandado(*args, **kwargs):
        token = obtenerTokenDelPedido()
        if token is None:
            return responderConError("Tenés que iniciar sesión", codigoHttp=401)

        usuarioDeSupabase = consultarUsuarioEnSupabase(token)
        if usuarioDeSupabase is None:
            return responderConError("Tu sesión venció, volvé a iniciar sesión", codigoHttp=401)

        with usarBaseDeDatos() as cursor:
            g.usuarioActual = buscarOCrearUsuario(cursor, usuarioDeSupabase)

        return rutaOriginal(*args, **kwargs)

    return rutaConCandado


def obtenerTokenDelPedido():
    encabezado = request.headers.get("Authorization", "")
    if not encabezado.startswith("Bearer "):
        return None
    return encabezado.removeprefix("Bearer ").strip() or None


def consultarUsuarioEnSupabase(token):
    """Le pregunta a Supabase de quién es el token. Devuelve None si no es válido."""
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError("Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY en el .env del backend")

    pedido = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={"Authorization": f"Bearer {token}", "apikey": SUPABASE_PUBLISHABLE_KEY},
    )
    try:
        with urllib.request.urlopen(pedido, timeout=5) as respuesta:
            return json.load(respuesta)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return None


def buscarOCrearUsuario(cursor, usuarioDeSupabase):
    """
    Conecta la cuenta de Supabase con nuestra tabla "usuarios".
      - Si ya está conectada (auth_id), la devuelve.
      - Si existe alguien con ese email, lo conecta.
      - Si no existe, lo crea (nombre y apellido se completan después).
    """
    idDeSupabase = usuarioDeSupabase["id"]
    email = usuarioDeSupabase["email"].lower()

    cursor.execute("SELECT id, nombre, apellido, email FROM usuarios WHERE auth_id = %s", (idDeSupabase,))
    usuario = cursor.fetchone()
    if usuario:
        return usuario

    cursor.execute(
        """
        UPDATE usuarios SET auth_id = %s, email_verificado = TRUE, ultima_sesion = NOW()
        WHERE LOWER(email) = %s AND auth_id IS NULL
        RETURNING id, nombre, apellido, email
        """,
        (idDeSupabase, email),
    )
    usuario = cursor.fetchone()
    if usuario:
        return usuario

    cursor.execute(
        """
        INSERT INTO usuarios (auth_id, nombre, apellido, email, rol,
                              email_verificado, activo, fecha_registro, ultima_sesion)
        VALUES (%s, '', '', %s, 'cliente', TRUE, TRUE, NOW(), NOW())
        RETURNING id, nombre, apellido, email
        """,
        (idDeSupabase, email),
    )
    return cursor.fetchone()
