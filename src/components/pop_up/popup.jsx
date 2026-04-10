import React from "react";
import "./popup.css";

export default function Popup({ title, isOpen, onClose, children, tag: Tag = 'div', onSubmit }) {
  if (!isOpen) return null;

  return (
    <Tag className="popup-overlay" onClick={onClose} onSubmit={onSubmit}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>{title}</h3>
          <button className="popup-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="popup-body">{children}</div>
      </div>
    </Tag>
  );
}
