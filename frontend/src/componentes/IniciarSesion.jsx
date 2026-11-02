import { useState } from 'react'
import { supabase } from '../servicios/supabase'

/**
 * Login con email en dos pasos:
 *   1) el usuario escribe su email  -> Supabase le manda un código
 *   2) escribe el código            -> queda logueado
 */
function IniciarSesion({ alCerrar, alIniciarSesion }) {
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [yaSeEnvioElCodigo, setYaSeEnvioElCodigo] = useState(false)
  const [estaEnviando, setEstaEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  async function enviarCodigoAlEmail(evento) {
    evento.preventDefault()
    setEstaEnviando(true)
    setMensaje(null)

    const { error } = await supabase.auth.signInWithOtp({ email })

    setEstaEnviando(false)
    if (error) {
      setMensaje(`No se pudo enviar el código: ${error.message}`)
      return
    }
    setYaSeEnvioElCodigo(true)
    setMensaje(`Te mandamos un código a ${email}. Revisá también la carpeta de spam.`)
  }

  async function verificarCodigo(evento) {
    evento.preventDefault()
    setEstaEnviando(true)
    setMensaje(null)

    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' })

    setEstaEnviando(false)
    if (error) {
      setMensaje('El código es incorrecto o venció. Probá de nuevo.')
      return
    }
    // Logueado: si quien la abrió quiere hacer algo después (ej: volver al turno), lo hace;
    // si no, simplemente se cierra la ventana de login
    if (alIniciarSesion) {
      alIniciarSesion()
    } else {
      alCerrar()
    }
  }

  return (
    <div>
      <h2>Iniciá sesión</h2>

      {!yaSeEnvioElCodigo ? (
        <form onSubmit={enviarCodigoAlEmail}>
          <label>
            Tu email:{' '}
            <input
              type="email"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </label>{' '}
          <button type="submit" disabled={estaEnviando}>
            {estaEnviando ? 'Enviando...' : 'Enviarme el código'}
          </button>
        </form>
      ) : (
        <form onSubmit={verificarCodigo}>
          <label>
            Código:{' '}
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value.trim())}
            />
          </label>{' '}
          <button type="submit" disabled={estaEnviando}>
            {estaEnviando ? 'Verificando...' : 'Ingresar'}
          </button>{' '}
          <button type="button" onClick={() => setYaSeEnvioElCodigo(false)}>
            Cambiar email
          </button>
        </form>
      )}

      {mensaje && <p>{mensaje}</p>}

      <button onClick={alCerrar}>Cerrar</button>
    </div>
  )
}

export default IniciarSesion
