import { useEffect, useState } from 'react'
import { cancelarReserva, obtenerMisTurnos } from '../servicios/api'
import { formatearFecha, formatearPrecio } from '../servicios/formatos'
import { usarSesion } from '../servicios/sesion'

const ESTADOS_QUE_SE_PUEDEN_CANCELAR = ['pendiente', 'confirmada']

/**
 * Lista las reservas del usuario y permite cancelar las que siguen activas.
 * Solo se muestra si inició sesión.
 */
function MisTurnos({ cantidadDeCambios, alCambiarLasReservas, alPedirInicioDeSesion }) {
  const [misTurnos, setMisTurnos] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [idTurnoParaCancelar, setIdTurnoParaCancelar] = useState(null)
  const sesion = usarSesion()
  const idDeLaSesion = sesion?.user.id

  // Se vuelve a cargar si alguien reserva/cancela o si cambia quién inició sesión
  useEffect(() => {
    if (!idDeLaSesion) {
      setMisTurnos([])
      setEstaCargando(false)
      return
    }
    setEstaCargando(true)
    obtenerMisTurnos()
      .then(setMisTurnos)
      .catch((error) => setMensaje({ tipo: 'error', texto: error.message }))
      .finally(() => setEstaCargando(false))
  }, [cantidadDeCambios, idDeLaSesion])

  async function confirmarCancelacion(idReserva) {
    setIdTurnoParaCancelar(null)
    try {
      await cancelarReserva(idReserva)
      setMensaje({ tipo: 'exito', texto: 'Reserva cancelada. El turno quedó libre otra vez.' })
      alCambiarLasReservas()
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    }
  }

  if (!sesion) {
    return (
      <div className="caja-vacia">
        <p style={{ marginBottom: 12 }}>Iniciá sesión para ver tus turnos.</p>
        <button className="boton boton-principal" onClick={alPedirInicioDeSesion}>
          Iniciar sesión
        </button>
      </div>
    )
  }
  if (estaCargando) return <p className="texto-suave">Cargando tus turnos...</p>

  return (
    <div>
      {mensaje && (
        <p className={`aviso ${mensaje.tipo === 'exito' ? 'aviso-exito' : 'aviso-error'}`}>{mensaje.texto}</p>
      )}

      {misTurnos.length === 0 ? (
        <p className="caja-vacia">Todavía no tenés turnos. Elegí una cancha y reservá el primero.</p>
      ) : (
        misTurnos.map((turno) => (
          <article key={turno.id} className="mi-turno">
            <div className="mi-turno-fila">
              <h3>{turno.cancha}</h3>
              <span className={`etiqueta etiqueta-${turno.estado}`}>{turno.estado}</span>
            </div>
            <p className="texto-suave">
              {formatearFecha(turno.fecha)} · {turno.hora_inicio} a {turno.hora_fin} · {formatearPrecio(turno.precio)}
            </p>

            {ESTADOS_QUE_SE_PUEDEN_CANCELAR.includes(turno.estado) && (
              <div className="mi-turno-acciones">
                {idTurnoParaCancelar === turno.id ? (
                  <>
                    <span>¿Seguro?</span>
                    <button className="boton boton-chico boton-peligro" onClick={() => confirmarCancelacion(turno.id)}>
                      Sí, cancelar
                    </button>
                    <button className="boton boton-chico boton-secundario" onClick={() => setIdTurnoParaCancelar(null)}>
                      No
                    </button>
                  </>
                ) : (
                  <button className="boton boton-chico boton-secundario" onClick={() => setIdTurnoParaCancelar(turno.id)}>
                    Cancelar turno
                  </button>
                )}
              </div>
            )}
          </article>
        ))
      )}
    </div>
  )
}

export default MisTurnos
