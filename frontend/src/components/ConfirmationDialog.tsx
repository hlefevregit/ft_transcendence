import React, { useEffect, useState } from 'react';
import '@/styles/ConfirmationDialog.css';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  message,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const [visible, setVisible] = useState(false);

  // entrée par slide-down
  useEffect(() => {
    setVisible(true);
  }, []);

  const handleClose = (confirmed: boolean) => {
    // slide-up puis callback
    setVisible(false);
    setTimeout(() => (confirmed ? onConfirm() : onCancel()), 300);
  };

  return (  
    <div className={`cd-overlay ${visible ? 'in' : 'out'}`}>
      <div className="cd-box">
        <p className="cd-message">{message}</p>
        <div className="cd-buttons">
          <button className="cd-btn cd-cancel" onClick={() => handleClose(false)}>
            ✕
          </button>
          <button className="cd-btn cd-confirm" onClick={() => handleClose(true)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
