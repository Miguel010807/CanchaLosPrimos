import { useEffect, useState } from 'react'
import { crearReserva, obtenerDisponibilidad } from '../servicios/api'
import { formatearFecha, formatearPrecio, obtenerFechaDeHoy, obtenerProximosDias } from '../servicios/formatos'
import { usarPerfil } from '../servicios/perfil'
import { usarSesion } from '../servicios/sesion'
import IniciarSesion from './IniciarSesion'

const CANTIDAD_DE_DIAS_PARA_ELEGIR = 14

/**
 * Turnos de una cancha para el día elegido.
 *   1) El usuario elige un día y toca un turno libre.
 *   2) Si no inició sesión, se abre el login; al entrar, vuelve al mismo turno.
 *      (Si es su primera vez, App le pide completar sus datos.)
 *   3) Abajo aparece la confirmación con el precio.
 */
function HorariosDeCancha({ cancha, cantidadDeCambios, alCambiarLasReservas }) {
  const [fechaElegida, setFechaElegida] = useState(obtenerFechaDeHoy())
  const [turnos, setTurnos] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [turnoElegido, setTurnoElegido] = useState(null)
  const [estaReservando, setEstaReservando] = useState(false)
  const sesion = usarSesion()
  const perfil = usarPerfil(sesion)

  const proximosDias = obtenerProximosDias(CANTIDAD_DE_DIAS_PARA_ELEGIR)

  // Se vuelven a pedir los turnos si cambia la fecha o si alguien reservó/canceló
  useEffect(() => {
    setEstaCargando(true)
    obtenerDisponibilidad(cancha.id, fechaElegida)
      .then((respuesta) => setTurnos(respuesta.turnos))
      .catch((error) => setMensaje({ tipo: 'error', texto: error.message }))
      .finally(() => setEstaCargando(false))
  }, [cancha.id, fechaElegida, cantidadDeCambios])

  function cambiarFecha(nuevaFecha) {
    setFechaElegida(nuevaFecha)
    setTurnoElegido(null)
    setMensaje(null)
  }

  function elegirTurno(turno) {
    setTurnoElegido(turno)
    setMensaje(null)
  }

  async function confirmarReserva() {
    setEstaReservando(true)
    try {
      await crearReserva({
        cancha_id: cancha.id,
        fecha: fechaElegida,
        hora_inicio: turnoElegido.hora_inicio,
        hora_fin: turnoElegido.hora_fin,
      })
      setMensaje({
        tipo: 'exito',
        texto: `¡Listo! Reservaste de ${turnoElegido.hora_inicio} a ${turnoElegido.hora_fin}. Lo ves en Mis turnos.`,
      })
      setTurnoElegido(null)
      alCambiarLasReservas() // actualiza los turnos y "Mis turnos"
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } finally {
      setEstaReservando(false)
    }
  }

  // Los turnos que ya pasaron no se muestran
  const turnosParaMostrar = turnos.filter((turno) => turno.estado !== 'Ya pasó')

  // Solo se puede confirmar si inició sesión y ya completó sus datos
  const puedeConfirmar = turnoElegido && perfil?.perfil_completo

  return (
    <div className="horarios">
      <div className="selector-de-dias" role="group" aria-label="Elegí el día">
        {proximosDias.map((dia) => (
          <button
            key={dia.fecha}
            className={`boton-dia ${dia.fecha === fechaElegida ? 'boton-dia-elegido' : ''}`}
            onClick={() => cambiarFecha(dia.fecha)}
            aria-pressed={dia.fecha === fechaElegida}
          >
            <span>{dia.nombreCorto}</span>
            <strong>{dia.numero}</strong>
          </button>
        ))}
      </div>

      {mensaje && (
        <p className={`aviso ${mensaje.tipo === 'exito' ? 'aviso-exito' : 'aviso-error'}`}>{mensaje.texto}</p>
      )}

      {estaCargando ? (
        <p className="texto-suave">Cargando horarios...</p>
      ) : turnosParaMostrar.length === 0 ? (
        <p className="caja-vacia">No hay más horarios para este día.</p>
      ) : (
        <div className="lista-de-turnos">
          {turnosParaMostrar.map((turno) => {
            const estaLibre = turno.estado === 'Libre'
            const estaElegido = turnoElegido?.hora_inicio === turno.hora_inicio
            const claseDelTurno = estaElegido ? 'turno-elegido' : estaLibre ? 'turno-libre' : 'turno-ocupado'
            return (
              <button
                key={turno.hora_inicio}
                className={`turno ${claseDelTurno}`}
                disabled={!estaLibre}
                onClick={() => elegirTurno(turno)}
              >
                <span className="turno-hora">
                  {turno.hora_inicio} – {turno.hora_fin}
                </span>
                <small>{estaElegido ? 'Elegido' : turno.estado}</small>
              </button>
            )
          })}
        </div>
      )}

      {/* Si eligió un turno sin haber iniciado sesión, se abre el login */}
      {turnoElegido && !sesion && (
        <IniciarSesion
          motivo="Para reservar tenés que iniciar sesión. Después volvés a este mismo turno."
          alCerrar={() => setTurnoElegido(null)}
          alIniciarSesion={() => {}} // no hace nada: al haber sesión, aparece solo la confirmación
        />
      )}

      {puedeConfirmar && (
        <div className="confirmacion">
          <p className="detalle">
            {cancha.nombre} · {formatearFecha(fechaElegida)} · {turnoElegido.hora_inicio} a {turnoElegido.hora_fin}
          </p>
          <p className="monto">{formatearPrecio(turnoElegido.precio)}</p>
          <div className="botones">
            <button className="boton boton-secundario" onClick={() => setTurnoElegido(null)}>
              Volver
            </button>
            <button className="boton boton-principal" onClick={confirmarReserva} disabled={estaReservando}>
              {estaReservando ? 'Reservando...' : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HorariosDeCancha
