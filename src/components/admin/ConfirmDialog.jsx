import './ConfirmDialog.css';

/**
 * Diálogo de confirmación reutilizable para eliminaciones (FR-005).
 * No se renderiza nada si `open` es false.
 */
const ConfirmDialog = ({
  open,
  title = 'Confirmar eliminación',
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        {message && <p className="confirm-dialog-message">{message}</p>}
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-btn confirm-dialog-btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-dialog-btn confirm-dialog-btn-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
