import React, { useState } from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ColorPickerModal = ({ isOpen, onClose, onColorSelect, currentColor, title = 'Farbe wählen' }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  // Expanded color palette with more options
  const colorGroups = {
    'Blau': [
      '#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'
    ],
    'Rot': [
      '#7f1d1d', '#991b1b', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fee2e2'
    ],
    'Grün': [
      '#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7'
    ],
    'Lila': [
      '#581c87', '#6b21a8', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#f3e8ff'
    ],
    'Orange': [
      '#7c2d12', '#9a3412', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'
    ],
    'Cyan': [
      '#164e63', '#155e75', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#cffafe'
    ],
    'Pink': [
      '#831843', '#9f1239', '#be185d', '#db2777', '#ec4899', '#f472b6', '#fbcfe8'
    ],
    'Gelb': [
      '#713f12', '#854d0e', '#ca8a04', '#eab308', '#facc15', '#fde047', '#fef08a'
    ],
    'Grau': [
      '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'
    ]
  };

  const handleConfirm = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="color-picker-modal">
        <div className="color-picker-modal__preview">
          <div 
            className="color-picker-modal__preview-box"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="color-picker-modal__preview-label">{selectedColor}</span>
        </div>

        <div className="color-picker-modal__groups">
          {Object.entries(colorGroups).map(([groupName, colors]) => (
            <div key={groupName} className="color-picker-modal__group">
              <h3 className="color-picker-modal__group-name">{groupName}</h3>
              <div className="color-picker-modal__colors">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-picker-modal__color ${selectedColor === color ? 'color-picker-modal__color--selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  >
                    {selectedColor === color && (
                      <FontAwesomeIcon icon={faCheck} className="color-picker-modal__check" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="color-picker-modal__custom">
          <label htmlFor="custom-color">Eigene Farbe:</label>
          <input
            id="custom-color"
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="color-picker-modal__input"
          />
        </div>

        <div className="color-picker-modal__actions">
          <button className="btn btn--secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button className="btn btn--primary" onClick={handleConfirm}>
            Farbe auswählen
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ColorPickerModal;
