import { useState } from 'react'
import { guardarMiPerfil } from '../servicios/api'
import { avisarQueCambioElPerfil } from '../servicios/perfil'
import VentanaEmergente from './VentanaEmergente'

/**
 * Formulario de datos personales, en una ventana emergente.
 * Se muestra la primera vez que alguien inicia sesión (no se puede cerrar sin completarlo).
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
      avisarQueCambioElPerfil() // así se cierra esta ventana y se actualiza el saludo
    } catch (error) {
      setMensajeDeError(error.message)
    } finally {
      setEstaGuardando(false)
    }
  }

  return (
    <VentanaEmergente titulo="Completá tus datos">
      <p className="texto-suave" style={{ marginBottom: 18 }}>
        Los necesitamos para tus reservas. Lo hacés una sola vez.
      </p>

      <form onSubmit={guardarDatos}>
        <label className="campo">
          Nombre
          <input required autoComplete="given-name" value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
        </label>
        <label className="campo">
          Apellido
          <input required autoComplete="family-name" value={apellido} onChange={(evento) => setApellido(evento.target.value)} />
        </label>
        <label className="campo">
          Teléfono
          <input
            type="tel"
            required
            autoComplete="tel"
            placeholder="11 3385-8925"
            value={telefono}
            onChange={(evento) => setTelefono(evento.target.value)}
          />
        </label>
        <button type="submit" className="boton boton-principal boton-ancho" disabled={estaGuardando}>
          {estaGuardando ? 'Guardando...' : 'Guardar'}
        </button>
      </form>

      {mensajeDeError && <p className="aviso aviso-error">{mensajeDeError}</p>}
    </VentanaEmergente>
  )
}

export default CompletarDatos
