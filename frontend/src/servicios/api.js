/**
 * Todas las llamadas al backend (Flask) están acá.
 * Si cambia la dirección del backend, se cambia en el archivo .env (VITE_API_URL).
 */
const URL_DEL_BACKEND = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

async function pedirAlBackend(ruta, opciones = {}) {
  const respuesta = await fetch(`${URL_DEL_BACKEND}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error ?? 'Hubo un problema al hablar con el servidor')
  }
  return datos
}

export function obtenerCanchas() {
  return pedirAlBackend('/api/canchas')
}

export function obtenerDisponibilidad(idCancha, fecha) {
  return pedirAlBackend(`/api/canchas/${idCancha}/disponibilidad?fecha=${fecha}`)
}

export function crearReserva(datosDeLaReserva) {
  return pedirAlBackend('/api/reservas', {
    method: 'POST',
    body: JSON.stringify(datosDeLaReserva),
  })
}

export function obtenerMisTurnos(idUsuario) {
  return pedirAlBackend(`/api/usuarios/${idUsuario}/reservas`)
}

export function cancelarReserva(idReserva, idUsuario, motivo = null) {
  return pedirAlBackend(`/api/reservas/${idReserva}/cancelar`, {
    method: 'POST',
    body: JSON.stringify({ usuario_id: idUsuario, motivo }),
  })
}
