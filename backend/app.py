import os
from flask import Flask, jsonify
from flask_cors import CORS
from database import CrearConexionALaBaseDeDatos
from config import FRONTEND_URL

app = Flask(__name__)
CORS(app, origins=os.getenv("FRONTEND_URL", "http://localhost:5173"))


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/db-test")
def db_test():
    """Prueba la conexión a Supabase y lista las tablas del schema public."""
    try:
        with CrearConexionALaBaseDeDatos() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            )
            tablas = [fila["table_name"] for fila in cur.fetchall()]
        return jsonify({"conectado": True, "tablas": tablas, "cantidad": len(tablas)})
    except Exception as e:
        return jsonify({"conectado": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
