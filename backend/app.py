"""
Punto de entrada del backend de Canchas Los Primos.

Para correrlo en la pc:   python app.py
Queda escuchando en:      http://localhost:5000
"""
from flask import Flask
from flask_cors import CORS

from config import FRONTEND_URL
from routes.rutas_de_canchas import rutasDeCanchas
from routes.rutas_de_estado import rutasDeEstado
from routes.rutas_de_reservas import rutasDeReservas


def crearAplicacion():
    aplicacion = Flask(__name__)
    
    # Muestra los acentos y la ñ tal cual en las respuestas JSON
    aplicacion.json.ensure_ascii = False

    # Permite que el frontend (React + Vite) le haga pedidos a este backend
    CORS(aplicacion, origins=FRONTEND_URL)

    # Registra las rutas: sin esto, Flask no sabe que existen
    aplicacion.register_blueprint(rutasDeEstado)
    aplicacion.register_blueprint(rutasDeCanchas)
    aplicacion.register_blueprint(rutasDeReservas)

    return aplicacion


app = crearAplicacion()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
