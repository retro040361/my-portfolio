import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// 共用的復古視窗風格 Modal（Projects / Playground 使用）
// 支援 Esc 關閉、鍵盤操作的視窗按鈕、開啟時鎖定背景捲動
const RetroModal = ({ title, onClose, children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className={`modal-box retro-window ${isMaximized ? 'is-maximized' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS/Linux 交通燈視窗標題列 */}
        <div className="login-window-header modal-window-header">
          <div className="window-controls">
            <button
              ref={closeBtnRef}
              type="button"
              className="control-dot red"
              title="關閉 (Esc)"
              aria-label="關閉"
              onClick={onClose}
            >
              <span className="dot-icon">✕</span>
            </button>
            <span className="control-dot yellow is-decorative" aria-hidden="true" />
            <button
              type="button"
              className="control-dot green"
              title={isMaximized ? "還原 (Restore)" : "放大 (Maximize)"}
              aria-label={isMaximized ? "還原視窗" : "放大視窗"}
              onClick={() => setIsMaximized(!isMaximized)}
            >
              <span className="dot-icon">{isMaximized ? '⤡' : '⤢'}</span>
            </button>
          </div>
          <div className="window-title modal-window-title">{title}</div>
          <div className="window-spacer" />
        </div>

        {/* 滾動內容包裝容器（讓 Cover Banner 隨捲動往上滑動消失） */}
        <div className="modal-scroll-body">{children}</div>
      </motion.div>
    </div>
  );
};

export default RetroModal;
