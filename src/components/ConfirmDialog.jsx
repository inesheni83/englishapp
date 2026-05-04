/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  // state shape when open: { title, message, confirmLabel, cancelLabel, danger, resolve }

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        danger: !!options.danger,
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (state) state.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => handleClose(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', zIndex: 10001,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '14px',
              maxWidth: '420px', width: '100%',
              padding: '22px 22px 18px',
              boxShadow: '0 18px 48px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {state.title}
            </h3>
            {state.message && (
              <p style={{ margin: '0 0 18px 0', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {state.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleClose(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => handleClose(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: state.danger ? '#EF4444' : 'var(--primary)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}
