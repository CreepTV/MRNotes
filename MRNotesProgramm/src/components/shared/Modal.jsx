import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faInfoCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Universelle Modal-Komponente für Dialoge
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium', // 'small', 'medium', 'large'
  type = 'default', // 'default', 'danger', 'warning', 'success', 'info'
  closeOnEscape = true,
  closeOnBackdrop = true
}) {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    if (firstFocusableRef.current) {
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="modal__icon modal__icon--danger" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="modal__icon modal__icon--warning" />;
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="modal__icon modal__icon--success" />;
      case 'info':
        return <FontAwesomeIcon icon={faInfoCircle} className="modal__icon modal__icon--info" />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div 
        ref={modalRef}
        className={`modal modal--${size} modal--${type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__title-wrapper">
            {getIcon()}
            <h2 id="modal-title" className="modal__title">{title}</h2>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Schließen"
            ref={firstFocusableRef}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="modal__content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
