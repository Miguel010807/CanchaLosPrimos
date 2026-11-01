
import { useEffect, useState } from 'react'
import { cancelarReserva, obtenerMisTurnos } from '../servicios/api'
import { formatearFecha, formatearPrecio } from '../servicios/formatos'
import { ID_DEL_USUARIO_DE_PRUEBA } from '../servicios/sesion'

const ESTADOS_QUE_SE_PUEDEN_CANCELAR = ['pendiente', 'confirmada']

/**
 * Lista las reservas del usuario y permite cancelar las que siguen activas.
 */
function MisTurnos({ cantidadDeCambios, alCambiarLasReservas }) {
  const [misTurnos, setMisTurnos] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [idTurnoParaCancelar, setIdTurnoParaCancelar] = useState(null)

  // Se vuelve a cargar cada vez que alguien reserva o cancela
  useEffect(() => {
    obtenerMisTurnos(ID_DEL_USUARIO_DE_PRUEBA)
      .then(setMisTurnos)
      .catch((error) => setMensaje(error.message))
      .finally(() => setEstaCargando(false))
  }, [cantidadDeCambios])

  async function confirmarCancelacion(idReserva) {
    setIdTurnoParaCancelar(null)
    try {
      await cancelarReserva(idReserva, ID_DEL_USUARIO_DE_PRUEBA)
      setMensaje('Reserva cancelada. El turno quedó libre otra vez.')
      alCambiarLasReservas()
    } catch (error) {
      setMensaje(error.message)
    }
  }

  if (estaCargando) return <p>Cargando tus turnos...</p>

  return (
    <div>
      {mensaje && <p>{mensaje}</p>}

      {misTurnos.length === 0 ? (
        <p>Todavía no tenés turnos reservados.</p>
      ) : (
        <ul>
          {misTurnos.map((turno) => (
            <li key={turno.id}>
              {turno.cancha} · {formatearFecha(turno.fecha)} · {turno.hora_inicio} a {turno.hora_fin} ·{' '}
              {formatearPrecio(turno.precio)} · <strong>{turno.estado}</strong>{' '}
              {ESTADOS_QUE_SE_PUEDEN_CANCELAR.includes(turno.estado) &&
                (idTurnoParaCancelar === turno.id ? (
                  <>
                    ¿Seguro?{' '}
                    <button onClick={() => confirmarCancelacion(turno.id)}>Sí, cancelar</button>{' '}
                    <button onClick={() => setIdTurnoParaCancelar(null)}>No</button>
                  </>
                ) : (
                  <button onClick={() => setIdTurnoParaCancelar(turno.id)}>Cancelar</button>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MisTurnos
