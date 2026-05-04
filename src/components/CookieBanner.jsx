import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fluent_cookie_acknowledged_v1';

// Banniere d'information cookies. A ce stade l'application n'utilise que des cookies
// de session strictement necessaires (Supabase Auth) qui ne requierent pas de consentement
// au sens du RGPD/ePrivacy. La banniere sert d'information transparente.
//
// Si vous ajoutez des cookies non essentiels (analytics, marketing), il faudra
// passer a un vrai mecanisme de consentement granulaire (accept / refuse / parametrer).
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Lecture initiale d'un systeme externe (localStorage) -> setState legitime
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage indisponible (mode prive) : on n'affiche rien
    }
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch { /* noop */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie information"
      style={{
        position: 'fixed',
        bottom: '76px',
        left: '12px',
        right: '12px',
        maxWidth: '520px',
        margin: '0 auto',
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 9000,
        fontSize: '0.85rem',
        color: 'var(--text-main)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>🍪</div>
        <div style={{ flex: 1, lineHeight: 1.5 }}>
          Fluent only uses cookies that are <strong>strictly necessary</strong> for
          your session (Supabase Auth). No advertising or tracking cookies.
          Read more in our Privacy Policy.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          onClick={acknowledge}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
