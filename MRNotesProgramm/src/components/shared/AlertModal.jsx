import Modal from './Modal';

/**
 * Info-Modal (Ersatz für alert())
 */
export default function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  buttonText = 'OK',
  type = 'info' // 'danger', 'warning', 'info', 'success'
}) {
  const footer = (
    <button 
      className="btn btn--primary"
      onClick={onClose}
      autoFocus
    >
      {buttonText}
    </button>
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
