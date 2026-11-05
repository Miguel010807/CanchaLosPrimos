/**
 * Funciones para mostrar datos lindos en pantalla.
 */

const NOMBRES_DE_LOS_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const NOMBRES_CORTOS_DE_LOS_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

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

/** Pasa una fecha de JavaScript a texto AAAA-MM-DD (usando la hora local, no la de Londres) */
function convertirFechaATexto(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/** Fecha de hoy en formato AAAA-MM-DD */
export function obtenerFechaDeHoy() {
  return convertirFechaATexto(new Date())
}

/**
 * Los próximos días a partir de hoy, para los botones de "elegí el día".
 * Ej: [{ fecha: '2026-11-07', nombreCorto: 'Sáb', numero: 7 }, ...]
 */
export function obtenerProximosDias(cantidad) {
  const hoy = new Date()
  return Array.from({ length: cantidad }, (_, indice) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + indice)
    return {
      fecha: convertirFechaATexto(fecha),
      nombreCorto: indice === 0 ? 'Hoy' : NOMBRES_CORTOS_DE_LOS_DIAS[fecha.getDay()],
      numero: fecha.getDate(),
    }
  })
}
