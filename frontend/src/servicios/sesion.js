/**
 * Sesión del usuario (login con Supabase Auth).
 *
 * usarSesion() se puede usar en cualquier componente:
 *     const sesion = usarSesion()
 *     if (sesion) { ...está logueado... }
 */
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function usarSesion() {
  const [sesion, setSesion] = useState(null)

  useEffect(() => {
    // Al abrir la página: ¿ya había una sesión iniciada?
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))

    // Después: se entera cada vez que alguien inicia o cierra sesión
    const { data } = supabase.auth.onAuthStateChange((_evento, sesionNueva) => {
      setSesion(sesionNueva)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return sesion
}

export function cerrarSesion() {
  return supabase.auth.signOut()
}
