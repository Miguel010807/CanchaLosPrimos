import { useState } from 'react'
import { guardarMiPerfil } from '../servicios/api'
import { avisarQueCambioElPerfil } from '../servicios/perfil'

/**
 * Formulario de datos personales. Se muestra la primera vez que alguien inicia sesión.
 */
function CompletarDatos({ perfil }) {
  const [nombre, setNombre] = useState(perfil.nombre)
  const [apellido, setApellido] = useState(perfil.apellido)
  const [telefono, setTelefono] = useState(perfil.telefono ?? '')
  const [estaGuardando, setEstaGuardando] = useState(false)
  const [mensajeDeError, setMensajeDeError] = useState(null)

  async function guardarDatos(evento) {
    evento.preventDefault()
    setEstaGuardando(true)
    setMensajeDeError(null)
    try {
      await guardarMiPerfil({ nombre, apellido, telefono })
      avisarQueCambioElPerfil() // así desaparece este formulario y se actualiza el saludo
    } catch (error) {
      setMensajeDeError(error.message)
    } finally {
      setEstaGuardando(false)
    }
  }

  return (
    <form onSubmit={guardarDatos}>
      <h3>Completá tus datos</h3>
      <p>Los necesitamos para tus reservas. Lo hacés una sola vez.</p>

      <label>
        Nombre:{' '}
        <input required value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
      </label>{' '}
      <label>
        Apellido:{' '}
        <input required value={apellido} onChange={(evento) => setApellido(evento.target.value)} />
      </label>{' '}
      <label>
        Teléfono:{' '}
        <input
          type="tel"
          required
          placeholder="11 3385-8925"
          value={telefono}
          onChange={(evento) => setTelefono(evento.target.value)}
        />
      </label>{' '}
      <button type="submit" disabled={estaGuardando}>
        {estaGuardando ? 'Guardando...' : 'Guardar'}
      </button>

      {mensajeDeError && <p>{mensajeDeError}</p>}
    </form>
  )
}

export default CompletarDatos
