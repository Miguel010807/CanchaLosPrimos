import { useEffect, useState } from 'react'
import { obtenerCanchas } from '../servicios/api'
import { formatearPrecio } from '../servicios/formatos'
import HorariosDeCancha from './HorariosDeCancha'

/**
 * Muestra las canchas que vienen de la base de datos (no escritas a mano).
 * Al tocar "Ver horarios" se despliegan los turnos de esa cancha.
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

  if (estaCargando) return <p>Cargando canchas...</p>
  if (mensajeDeError) return <p>No se pudieron cargar las canchas: {mensajeDeError}</p>

  return (
    <div>
      {canchas.map((cancha) => (
        <article key={cancha.id}>
          <h3>{cancha.nombre}</h3>
          <p>{cancha.descripcion}</p>
          <p>Hasta {cancha.capacidad} jugadores · {formatearPrecio(cancha.precio_base)} la hora</p>

          <button onClick={() => abrirOCerrarHorarios(cancha.id)}>
            {idCanchaAbierta === cancha.id ? 'Ocultar horarios' : 'Ver horarios'}
          </button>

          {idCanchaAbierta === cancha.id && (
            <HorariosDeCancha
              cancha={cancha}
              cantidadDeCambios={cantidadDeCambios}
              alCambiarLasReservas={alCambiarLasReservas}
            />
          )}
        </article>
      ))}
    </div>
  )
}

export default ListaDeCanchas
