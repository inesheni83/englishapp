/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

const TYPE_META = {
  success: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: '✅' },
  error:   { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', icon: '⚠️' },
  info:    { color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', icon: 'ℹ️' },
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration ?? DEFAULT_DURATION,
    };
    setToasts(prev => [...prev, toast]);
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
    return id;
  }, [dismiss]);

  const api = {
    success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
    error:   (msg, opts) => show(msg, { ...opts, type: 'error' }),
    info:    (msg, opts) => show(msg, { ...opts, type: 'info' }),
    show,
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      role="region"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: 'calc(100% - 24px)',
        maxWidth: '440px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const meta = TYPE_META[toast.type] || TYPE_META.info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide-in on mount
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="status"
      style={{
        background: 'white',
        border: `1px solid ${meta.border}`,
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        pointerEvents: 'auto',
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? '0' : '-12px'})`,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        fontSize: '0.9rem',
        color: 'var(--text-main)',
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0, lineHeight: 1.4 }}>{meta.icon}</span>
      <div style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '1.1rem',
          padding: '0 2px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
