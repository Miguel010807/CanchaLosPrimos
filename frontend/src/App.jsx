import './App.css'

function App() {
  return (
    <div>
      <header>
        <h1>⚽ Los Primos</h1>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#canchas">Canchas</a>
          <a href="#ubicacion">Ubicación</a>
          <a href="#contacto">Contacto</a>
          <button>Iniciar sesión</button>
        </nav>
      </header>

      <main>
        <section id="inicio">
          <h2>Fútbol 5 Los Primos</h2>
          <p>Reservá tu cancha de manera rápida y sencilla.</p>

          <button>Reservar cancha</button>
        </section>

        <section id="canchas">
          <h2>Nuestras canchas</h2>

          <div>
            <article>
              <h3>Cancha 1</h3>
              <p>Fútbol 5 · Césped sintético</p>
              <button>Ver horarios</button>
            </article>

            <article>
              <h3>Cancha 2</h3>
              <p>Fútbol 5 · Césped sintético</p>
              <button>Ver horarios</button>
            </article>
          </div>
        </section>

        <section id="ubicacion">
          <h2>¿Dónde estamos?</h2>
          <p>Encontranos en Los Primos.</p>
        </section>

        <section id="contacto">
          <h2>Contacto</h2>
          <p>¿Tenés alguna consulta? Comunicate con nosotros.</p>
        </section>
      </main>

      <footer>
        <p>© 2026 Los Primos - Fútbol 5</p>
      </footer>
    </div>
  )
}

export default App
