from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL


def CrearConexionALaBaseDeDatos():
    if not DATABASE_URL:
        raise RuntimeError("Falta DATABASE_URL en el archivo .env")
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor,
        sslmode="require",
    )


@contextmanager
def usarBaseDeDatos():
    conexion = CrearConexionALaBaseDeDatos()
    try:
        with conexion.cursor() as cursor:
            yield cursor
        conexion.commit()
    except Exception:
        conexion.rollback()
        raise
    finally:
        conexion.close()
