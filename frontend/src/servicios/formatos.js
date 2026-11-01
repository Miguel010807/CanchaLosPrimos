/**
 * Funciones para mostrar datos lindos en pantalla.
 */

const NOMBRES_DE_LOS_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

/** 40000 -> "$40.000" */
export function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`
}

/** "2026-11-07" -> "sábado 7/11" */
export function formatearFecha(textoFecha) {
  const [anio, mes, dia] = textoFecha.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)
  return `${NOMBRES_DE_LOS_DIAS[fecha.getDay()]} ${dia}/${mes}`
}

/** Fecha de hoy en formato AAAA-MM-DD (hora de Argentina, no la de Londres) */
export function obtenerFechaDeHoy() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}
