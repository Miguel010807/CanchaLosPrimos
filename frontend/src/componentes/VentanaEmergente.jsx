/**
 * Ventana que aparece encima de la página (en el celu sube desde abajo).
 * Se usa para el login y para "Completá tus datos".
 */
function VentanaEmergente({ titulo, alCerrar, children }) {
  return (
    <div className="fondo-oscuro" onClick={alCerrar}>
      {/* stopPropagation: tocar adentro de la ventana no la cierra */}
      <div className="ventana" role="dialog" aria-label={titulo} onClick={(evento) => evento.stopPropagation()}>
        <div className="ventana-encabezado">
          <h2 className="titulo">{titulo}</h2>
          {alCerrar && (
            <button className="boton-cerrar" onClick={alCerrar} aria-label="Cerrar">
              ×
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export default VentanaEmergente
