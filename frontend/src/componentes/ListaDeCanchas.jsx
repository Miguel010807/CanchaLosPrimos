import { useEffect, useState } from 'react'
import { obtenerCanchas } from '../servicios/api'
import { formatearPrecio } from '../servicios/formatos'
import HorariosDeCancha from './HorariosDeCancha'

/**
 * Tarjetas de las canchas (vienen de la base de datos).
 * Al tocar "Ver horarios" se despliegan los turnos de esa cancha.
 *
 * Fotos: se buscan en frontend/public/fotos/ con el nombre cancha-f5.jpg, cancha-f4.jpg
 * (según el tipo de cancha). Si todavía no están, se ve un recuadro gris.
 */
function ListaDeCanchas({ cantidadDeCambios, alCambiarLasReservas }) {
  const [canchas, setCanchas] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensajeDeError, setMensajeDeError] = useState(null)
  const [idCanchaAbierta, setIdCanchaAbierta] = useState(null)

  useEffect(() => {
    obtenerCanchas()
      .then(setCanchas)
      .catch((error) => setMensajeDeError(error.message))
      .finally(() => setEstaCargando(false))
  }, [])

  function abrirOCerrarHorarios(idCancha) {
    setIdCanchaAbierta(idCanchaAbierta === idCancha ? null : idCancha)
  }

  if (estaCargando) return <p className="texto-suave">Cargando canchas...</p>
  if (mensajeDeError) return <p className="aviso aviso-error">No se pudieron cargar las canchas: {mensajeDeError}</p>

  return (
    <div>
      {canchas.map((cancha) => {
        const estaAbierta = idCanchaAbierta === cancha.id
        return (
          <article key={cancha.id} className="tarjeta-cancha">
            <div
              className="foto-cancha"
              role="img"
              aria-label={`Foto de la ${cancha.nombre}`}
              style={{ backgroundImage: `url('/fotos/cancha-${cancha.tipo.toLowerCase()}.jpg')` }}
            />

            <div className="tarjeta-cancha-cuerpo">
              <div className="tarjeta-cancha-fila">
                <h3>{cancha.nombre}</h3>
                <span className="precio">{formatearPrecio(cancha.precio_base)}</span>
              </div>
              <p className="texto-suave">
                Hasta {cancha.capacidad} jugadores · Pasto sintético · por hora
              </p>

              <button
                className={`boton boton-ancho ${estaAbierta ? 'boton-secundario' : 'boton-principal'}`}
                onClick={() => abrirOCerrarHorarios(cancha.id)}
              >
                {estaAbierta ? 'Ocultar horarios' : 'Ver horarios'}
              </button>
            </div>

            {estaAbierta && (
              <HorariosDeCancha
                cancha={cancha}
                cantidadDeCambios={cantidadDeCambios}
                alCambiarLasReservas={alCambiarLasReservas}
              />
            )}
          </article>
        )
      })}
    </div>
  )
}

export default ListaDeCanchas
