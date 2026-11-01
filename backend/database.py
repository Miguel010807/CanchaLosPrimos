import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("Falta DATABASE_URL en el archivo .env")
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, sslmode="require")

