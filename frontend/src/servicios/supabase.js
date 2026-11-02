/**
 * Conexión con Supabase, usada SOLO para el login (Auth).
 * Los datos (canchas, reservas) se siguen pidiendo a nuestro backend Flask.
 */
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
