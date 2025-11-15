import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';

/**
 * Modal für Text-Eingaben (Ersatz für prompt())
 */
export default function InputModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  label,
  placeholder = '',
  defaultValue = '',
  submitText = 'OK',
  cancelText = 'Abbrechen',
  required = true,
  maxLength = 100,
  type = 'text' // 'text', 'textarea', 'email', 'url'
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (required && !value.trim()) return;
    onSubmit(value.trim());
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSubmit(e);
    }
  };

  const footer = (
    <>
      <button 
        className="btn btn--secondary"
        onClick={onClose}
        type="button"
      >
        {cancelText}
      </button>
      <button 
        className="btn btn--primary"
        onClick={handleSubmit}
        disabled={required && !value.trim()}
        type="submit"
      >
        {submitText}
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
    >
      <form onSubmit={handleSubmit}>
        {label && <label className="modal__label">{label}</label>}
        
        {type === 'textarea' ? (
          <textarea
            ref={inputRef}
            className="modal__input modal__textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={4}
            required={required}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            className="modal__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
          />
        )}
        
        {maxLength && (
          <div className="modal__hint">
            {value.length} / {maxLength} Zeichen
          </div>
        )}
      </form>
    </Modal>
  );
}
