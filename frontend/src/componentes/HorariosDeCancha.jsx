import { useEffect, useState } from 'react'
import { crearReserva, obtenerDisponibilidad } from '../servicios/api'
import { formatearFecha, formatearPrecio, obtenerFechaDeHoy } from '../servicios/formatos'
import { usarSesion } from '../servicios/sesion'
import IniciarSesion from './IniciarSesion'

/**
 * Muestra los turnos de una cancha para el día elegido (Libre / Ocupada).
 * Para reservar, primero pide confirmación.
 * Si no inició sesión, le pide iniciarla ahí mismo y después vuelve al mismo turno.
 */
function HorariosDeCancha({ cancha, cantidadDeCambios, alCambiarLasReservas }) {
  const [fechaElegida, setFechaElegida] = useState(obtenerFechaDeHoy())
  const [turnos, setTurnos] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [turnoParaConfirmar, setTurnoParaConfirmar] = useState(null)
  const sesion = usarSesion()

  // Se vuelven a pedir los turnos si cambia la fecha o si alguien reservó/canceló
  useEffect(() => {
    setEstaCargando(true)
    obtenerDisponibilidad(cancha.id, fechaElegida)
      .then((respuesta) => setTurnos(respuesta.turnos))
      .catch((error) => setMensaje(error.message))
      .finally(() => setEstaCargando(false))
  }, [cancha.id, fechaElegida, cantidadDeCambios])

  function cambiarFecha(nuevaFecha) {
    setFechaElegida(nuevaFecha)
    setTurnoParaConfirmar(null)
    setMensaje(null)
  }

  async function confirmarReserva() {
    const turno = turnoParaConfirmar
    setTurnoParaConfirmar(null)
    try {
      await crearReserva({
        cancha_id: cancha.id,
        fecha: fechaElegida,
        hora_inicio: turno.hora_inicio,
        hora_fin: turno.hora_fin,
      })
      setMensaje(`¡Listo! Reservaste de ${turno.hora_inicio} a ${turno.hora_fin}. Queda pendiente de pago.`)
      alCambiarLasReservas() // actualiza los turnos y "Mis turnos"
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div>
      <label>
        Elegí el día:{' '}
        <input
          type="date"
          value={fechaElegida}
          min={obtenerFechaDeHoy()}
          onChange={(evento) => cambiarFecha(evento.target.value)}
        />
      </label>

      {mensaje && <p>{mensaje}</p>}

      {turnoParaConfirmar && !sesion && (
        <div>
          <p>Para reservar tenés que iniciar sesión.</p>
          <IniciarSesion
            alCerrar={() => setTurnoParaConfirmar(null)}
            alIniciarSesion={() => {}} // no hace nada: al haber sesión, aparece solo la confirmación del mismo turno
          />
        </div>
      )}

      {turnoParaConfirmar && sesion && (
        <div>
          <p>
            ¿Reservar <strong>{cancha.nombre}</strong> el {formatearFecha(fechaElegida)} de{' '}
            {turnoParaConfirmar.hora_inicio} a {turnoParaConfirmar.hora_fin} por{' '}
            {formatearPrecio(turnoParaConfirmar.precio)}?
          </p>
          <button onClick={confirmarReserva}>Confirmar</button>{' '}
          <button onClick={() => setTurnoParaConfirmar(null)}>Volver</button>
        </div>
      )}

      {estaCargando ? (
        <p>Cargando horarios...</p>
      ) : turnos.length === 0 ? (
        <p>No hay horarios para este día.</p>
      ) : (
        <ul>
          {turnos.map((turno) => (
            <li key={turno.hora_inicio}>
              {turno.hora_inicio} a {turno.hora_fin} · {turno.estado}{' '}
              {turno.estado === 'Libre' && (
                <button onClick={() => setTurnoParaConfirmar(turno)}>Reservar</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HorariosDeCancha
