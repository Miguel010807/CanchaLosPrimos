import { useState } from 'react'
import { supabase } from '../servicios/supabase'
import VentanaEmergente from './VentanaEmergente'

/**
 * Login de dos formas, en una ventana emergente:
 *   - Con Google: un botón que lleva a Google y vuelve logueado.
 *   - Con email en dos pasos:
 *       1) el usuario escribe su email  -> Supabase le manda un código
 *       2) escribe el código            -> queda logueado
 */
function IniciarSesion({ alCerrar, alIniciarSesion, motivo }) {
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [yaSeEnvioElCodigo, setYaSeEnvioElCodigo] = useState(false)
  const [estaEnviando, setEstaEnviando] = useState(false)
  const [mensajeDeError, setMensajeDeError] = useState(null)

  async function iniciarSesionConGoogle() {
    // Lleva al usuario a Google; cuando termina, Google lo devuelve a esta misma página ya logueado
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setMensajeDeError(`No se pudo iniciar sesión con Google: ${error.message}`)
  }

  async function enviarCodigoAlEmail(evento) {
    evento.preventDefault()
    setEstaEnviando(true)
    setMensajeDeError(null)

    const { error } = await supabase.auth.signInWithOtp({ email })

    setEstaEnviando(false)
    if (error) {
      setMensajeDeError(`No se pudo enviar el código: ${error.message}`)
      return
    }
    setYaSeEnvioElCodigo(true)
  }

  async function verificarCodigo(evento) {
    evento.preventDefault()
    setEstaEnviando(true)
    setMensajeDeError(null)

    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' })

    setEstaEnviando(false)
    if (error) {
      setMensajeDeError('El código es incorrecto o venció. Probá de nuevo.')
      return
    }
    // Logueado: si quien la abrió quiere hacer algo después (ej: volver al turno), lo hace;
    // si no, simplemente se cierra la ventana
    if (alIniciarSesion) {
      alIniciarSesion()
    } else {
      alCerrar()
    }
  }

  return (
    <VentanaEmergente titulo="Iniciá sesión" alCerrar={alCerrar}>
      <p className="texto-suave" style={{ marginBottom: 18 }}>
        {motivo ?? 'Entrá para reservar y ver tus turnos.'}
      </p>

      {!yaSeEnvioElCodigo ? (
        <>
          <button className="boton boton-google boton-ancho" onClick={iniciarSesionConGoogle}>
            <span aria-hidden="true" style={{ fontWeight: 700, color: '#4285F4' }}>G</span>
            Continuar con Google
          </button>

          <div className="separador">o con tu email</div>

          <form onSubmit={enviarCodigoAlEmail}>
            <label className="campo">
              Email
              <input
                type="email"
                required
                placeholder="nombre@gmail.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </label>
            <button type="submit" className="boton boton-principal boton-ancho" disabled={estaEnviando}>
              {estaEnviando ? 'Enviando...' : 'Enviarme un código'}
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={verificarCodigo}>
          <p className="aviso">
            Te mandamos un código a <strong>{email}</strong>. Revisá también la carpeta de spam.
          </p>
          <label className="campo">
            Código
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value.trim())}
            />
          </label>
          <button type="submit" className="boton boton-principal boton-ancho" disabled={estaEnviando}>
            {estaEnviando ? 'Verificando...' : 'Ingresar'}
          </button>
          <button
            type="button"
            className="boton boton-secundario boton-ancho"
            style={{ marginTop: 8 }}
            onClick={() => setYaSeEnvioElCodigo(false)}
          >
            Cambiar email
          </button>
        </form>
      )}

      {mensajeDeError && <p className="aviso aviso-error">{mensajeDeError}</p>}
    </VentanaEmergente>
  )
}

export default IniciarSesion
