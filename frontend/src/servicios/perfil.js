
/**
 * Datos personales del usuario logueado (nombre, apellido, teléfono).
 *
 * usarPerfil(sesion) se puede usar en cualquier componente:
 *     const perfil = usarPerfil(sesion)
 *     perfil === null              -> todavía cargando (o no hay sesión)
 *     perfil.perfil_completo       -> true si ya cargó sus datos
 */
import { useEffect, useState } from 'react'
import { obtenerMiPerfil } from './api'

const EVENTO_PERFIL_ACTUALIZADO = 'perfil-actualizado'

export function usarPerfil(sesion) {
  const [perfil, setPerfil] = useState(null)
  const idDeLaSesion = sesion?.user.id

  useEffect(() => {
    if (!idDeLaSesion) {
      setPerfil(null)
      return
    }

    function cargarPerfil() {
      obtenerMiPerfil()
        .then(setPerfil)
        .catch(() => setPerfil(null))
    }

    cargarPerfil()
    // Si en otra parte de la página alguien guarda sus datos, se vuelve a cargar acá también
    window.addEventListener(EVENTO_PERFIL_ACTUALIZADO, cargarPerfil)
    return () => window.removeEventListener(EVENTO_PERFIL_ACTUALIZADO, cargarPerfil)
  }, [idDeLaSesion])

  return perfil
}

/** Avisa a toda la página que el perfil cambió (para que se actualice en todos lados). */
export function avisarQueCambioElPerfil() {
  window.dispatchEvent(new Event(EVENTO_PERFIL_ACTUALIZADO))
}
