import Modal from './Modal';

/**
 * Bestätigungs-Modal (Ersatz für confirm())
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  type = 'warning' // 'danger', 'warning', 'info', 'success'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <>
      <button 
        className="btn btn--secondary"
        onClick={onClose}
      >
        {cancelText}
      </button>
      <button 
        className={`btn ${type === 'danger' ? 'btn--danger' : 'btn--primary'}`}
        onClick={handleConfirm}
        autoFocus
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="small"
      type={type}
    >
      <p className="modal__message">{message}</p>
    </Modal>
  );
}
