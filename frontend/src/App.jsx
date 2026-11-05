import { useState } from 'react'
import './App.css'
import CompletarDatos from './componentes/CompletarDatos'
import IniciarSesion from './componentes/IniciarSesion'
import ListaDeCanchas from './componentes/ListaDeCanchas'
import MisTurnos from './componentes/MisTurnos'
import { usarPerfil } from './servicios/perfil'
import { cerrarSesion, usarSesion } from './servicios/sesion'

function App() {
  // Cada vez que se reserva o cancela, este número sube.
  // Así "Horarios" y "Mis turnos" saben que tienen que actualizarse.
  const [cantidadDeCambios, setCantidadDeCambios] = useState(0)

  // Sesión y datos del usuario (null = no inició sesión / todavía cargando)
  const sesion = usarSesion()
  const perfil = usarPerfil(sesion)
  const [mostrarLogin, setMostrarLogin] = useState(false)

  function avisarQueCambiaronLasReservas() {
    setCantidadDeCambios((cantidadAnterior) => cantidadAnterior + 1)
  }

  return (
    <>
      <header className="encabezado">
        <div className="contenedor">
          <a href="#inicio" className="marca">
            {/* Cuando tengas el logo, guardalo en frontend/public/fotos/logo.png y cambiá "LP" por:
                <img src="/fotos/logo.png" alt="" /> */}
            <span className="marca-logo">LP</span>
            <span className="marca-nombre">LOS PRIMOS</span>
          </a>

          <nav className="menu">
            <a href="#canchas" className="solo-pantalla-grande">Canchas</a>
            <a href="#mis-turnos">Mis turnos</a>
            {sesion ? (
              <>
                <span className="saludo solo-pantalla-grande">Hola, {perfil?.nombre || 'crack'}</span>
                <button className="boton boton-chico boton-secundario" onClick={cerrarSesion}>
                  Salir
                </button>
              </>
            ) : (
              <button className="boton boton-chico boton-principal" onClick={() => setMostrarLogin(true)}>
                Ingresar
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Foto de fondo: frontend/public/fotos/portada.jpg */}
        <section id="inicio" className="portada">
          <div className="contenedor">
            <h1 className="titulo">
              Reservá tu
              <br />
              <span>cancha</span>
            </h1>
            <p className="texto-suave">Fútbol 5 y Fútbol 4 · Av. Larrazábal 4365, CABA</p>
            <a href="#canchas" className="boton boton-principal" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Ver horarios
            </a>
          </div>
        </section>

        <section id="canchas" className="seccion">
          <div className="contenedor">
            <h2 className="titulo-de-seccion">Nuestras canchas</h2>
            <ListaDeCanchas
              cantidadDeCambios={cantidadDeCambios}
              alCambiarLasReservas={avisarQueCambiaronLasReservas}
            />
          </div>
        </section>

        <section id="mis-turnos" className="seccion">
          <div className="contenedor">
            <h2 className="titulo-de-seccion">Mis turnos</h2>
            <MisTurnos
              cantidadDeCambios={cantidadDeCambios}
              alCambiarLasReservas={avisarQueCambiaronLasReservas}
              alPedirInicioDeSesion={() => setMostrarLogin(true)}
            />
          </div>
        </section>
      </main>

      <footer id="contacto" className="pie">
        <div className="contenedor">
          <span className="marca-nombre">LOS PRIMOS · FÚTBOL CLUB</span>
          <p>📍 Av. Larrazábal 4365, CABA</p>
          <p>
            📞 <a href="tel:+541133858925">11 3385-8925</a>
          </p>
          <p>
            📸 <a href="https://www.instagram.com/losprimos.f5/" target="_blank" rel="noreferrer">@losprimos.f5</a>
          </p>
          <p>Abrimos todos los días desde las 15 hs · Viernes y sábados hasta las 2 hs</p>
        </div>
      </footer>

      {/* Ventanas emergentes */}
      {mostrarLogin && !sesion && <IniciarSesion alCerrar={() => setMostrarLogin(false)} />}

      {/* La primera vez que alguien inicia sesión, le pedimos sus datos (no se puede saltear) */}
      {perfil && !perfil.perfil_completo && <CompletarDatos perfil={perfil} />}
    </>
  )
}

export default App
