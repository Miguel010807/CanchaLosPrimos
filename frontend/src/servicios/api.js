/**
 * Todas las llamadas al backend (Flask) están acá.
 * Si cambia la dirección del backend, se cambia en el archivo .env (VITE_API_URL).
 */
import { supabase } from './supabase'

const URL_DEL_BACKEND = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

/** Si el usuario inició sesión, devuelve el encabezado con su token (el "carnet" para el candado). */
async function obtenerEncabezadoDeSesion() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function pedirAlBackend(ruta, opciones = {}) {
  const respuesta = await fetch(`${URL_DEL_BACKEND}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(await obtenerEncabezadoDeSesion()),
    },
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error ?? 'Hubo un problema al hablar con el servidor')
  }
  return datos
}

// ---- Rutas públicas (no hace falta iniciar sesión) ----

export function obtenerCanchas() {
  return pedirAlBackend('/api/canchas')
}

export function obtenerDisponibilidad(idCancha, fecha) {
  return pedirAlBackend(`/api/canchas/${idCancha}/disponibilidad?fecha=${fecha}`)
}

// ---- Rutas con candado (hace falta iniciar sesión) ----

export function crearReserva(datosDeLaReserva) {
  return pedirAlBackend('/api/reservas', {
    method: 'POST',
    body: JSON.stringify(datosDeLaReserva),
  })
}

export function cancelarReserva(idReserva, motivo = null) {
  return pedirAlBackend(`/api/reservas/${idReserva}/cancelar`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  })
}

export function obtenerMisTurnos() {
  return pedirAlBackend('/api/mis-reservas')
}
