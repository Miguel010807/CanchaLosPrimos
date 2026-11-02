import { useState } from 'react'
import './App.css'
import IniciarSesion from './componentes/IniciarSesion'
import ListaDeCanchas from './componentes/ListaDeCanchas'
import MisTurnos from './componentes/MisTurnos'
import { cerrarSesion, usarSesion } from './servicios/sesion'

function App() {
  // Cada vez que se reserva o cancela, este número sube.
  // Así "Horarios" y "Mis turnos" saben que tienen que actualizarse.
  const [cantidadDeCambios, setCantidadDeCambios] = useState(0)

  // Sesión del usuario: null = no inició sesión
  const sesion = usarSesion()
  const [mostrarLogin, setMostrarLogin] = useState(false)

  function avisarQueCambiaronLasReservas() {
    setCantidadDeCambios((cantidadAnterior) => cantidadAnterior + 1)
  }

  return (
    <div>
      <header>
        <h1>⚽ Los Primos</h1>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#canchas">Canchas</a>
          <a href="#mis-turnos">Mis turnos</a>
          <a href="#ubicacion">Ubicación</a>
          <a href="#contacto">Contacto</a>
          {sesion ? (
            <>
              <span>Hola, {sesion.user.email}</span>{' '}
              <button onClick={cerrarSesion}>Cerrar sesión</button>
            </>
          ) : (
            <button onClick={() => setMostrarLogin(true)}>Iniciar sesión</button>
          )}
        </nav>
      </header>

      {mostrarLogin && !sesion && <IniciarSesion alCerrar={() => setMostrarLogin(false)} />}

      <main>
        <section id="inicio">
          <h2>Fútbol Los Primos</h2>
          <p>Reservá tu cancha de manera rápida y sencilla.</p>

          <button>Reservar cancha</button>
        </section>

        <section id="canchas">
          <h2>Nuestras canchas</h2>

          {/* Las canchas ahora vienen de la base de datos */}
          <ListaDeCanchas
            cantidadDeCambios={cantidadDeCambios}
            alCambiarLasReservas={avisarQueCambiaronLasReservas}
          />
        </section>

        <section id="mis-turnos">
          <h2>Mis turnos</h2>

          <MisTurnos
            cantidadDeCambios={cantidadDeCambios}
            alCambiarLasReservas={avisarQueCambiaronLasReservas}
          />
        </section>

        <section id="ubicacion">
          <h2>¿Dónde estamos?</h2>
          <p>Av. Larrazábal 4365, CABA</p>
        </section>

        <section id="contacto">
          <h2>Contacto</h2>
          <p>¿Tenés alguna consulta? Comunicate con nosotros.</p>
          <p>📞 11 3385-8925</p>
        </section>
      </main>

      <footer>
        <p>© 2026 Los Primos - Fútbol 5 y Fútbol 4</p>
      </footer>
    </div>
  )
}

export default App
