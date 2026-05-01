import { useState } from 'react';
import { PRIVACY_POLICY_MARKDOWN } from '../legal/privacy.js';
import { TERMS_MARKDOWN } from '../legal/terms.js';
import { LEGAL_NOTICE_MARKDOWN } from '../legal/legalNotice.js';

const DOCS = {
  privacy: { title: 'Politique de confidentialité', md: PRIVACY_POLICY_MARKDOWN },
  terms: { title: "Conditions Générales d'Utilisation", md: TERMS_MARKDOWN },
  legal: { title: 'Mentions légales', md: LEGAL_NOTICE_MARKDOWN },
};

// Very small markdown -> HTML renderer (headings, bold, lists, paragraphs).
// Sufficient for the static legal documents we ship; avoids adding a dependency.
function renderMarkdown(md) {
  const lines = md.split('\n');
  const blocks = [];
  let buffer = [];
  let listType = null;

  const flushBuffer = () => {
    if (buffer.length) {
      blocks.push({ type: 'p', content: buffer.join(' ') });
      buffer = [];
    }
  };
  const flushList = () => {
    if (listType) {
      blocks.push({ type: listType, items: [...listItems] });
      listItems.length = 0;
      listType = null;
    }
  };
  const listItems = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBuffer();
      flushList();
      continue;
    }
    if (line.startsWith('# ')) {
      flushBuffer(); flushList();
      blocks.push({ type: 'h1', content: line.slice(2) });
    } else if (line.startsWith('## ')) {
      flushBuffer(); flushList();
      blocks.push({ type: 'h2', content: line.slice(3) });
    } else if (line.startsWith('### ')) {
      flushBuffer(); flushList();
      blocks.push({ type: 'h3', content: line.slice(4) });
    } else if (line.startsWith('- ')) {
      flushBuffer();
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listItems.push(line.slice(2));
    } else if (line.startsWith('|')) {
      // Skip markdown tables (rare in our docs, would need more work)
      flushBuffer(); flushList();
      blocks.push({ type: 'p', content: line });
    } else {
      buffer.push(line);
    }
  }
  flushBuffer(); flushList();

  const renderInline = (text) => {
    // bold **x**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>);
  };

  return blocks.map((b, i) => {
    if (b.type === 'h1') return <h1 key={i} style={{ fontSize: '1.6rem', marginTop: '0', marginBottom: '12px' }}>{b.content}</h1>;
    if (b.type === 'h2') return <h2 key={i} style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '8px', color: 'var(--primary)' }}>{b.content}</h2>;
    if (b.type === 'h3') return <h3 key={i} style={{ fontSize: '1rem', marginTop: '16px', marginBottom: '6px' }}>{b.content}</h3>;
    if (b.type === 'p') return <p key={i} style={{ margin: '0 0 12px 0', lineHeight: 1.6, fontSize: '0.92rem' }}>{renderInline(b.content)}</p>;
    if (b.type === 'ul') return (
      <ul key={i} style={{ margin: '0 0 12px 0', paddingLeft: '22px', lineHeight: 1.6, fontSize: '0.92rem' }}>
        {b.items.map((it, j) => <li key={j} style={{ marginBottom: '4px' }}>{renderInline(it)}</li>)}
      </ul>
    );
    return null;
  });
}

// Inline version of the legal document, for use inside a full page (no modal).
export function LegalDocInline({ docKey }) {
  const doc = DOCS[docKey];
  if (!doc) return null;
  return (
    <div className="card" style={{ padding: '24px', color: 'var(--text-main)' }}>
      {renderMarkdown(doc.md)}
    </div>
  );
}

export function LegalDocModal({ docKey, onClose }) {
  const doc = DOCS[docKey];
  if (!doc) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', zIndex: 9999,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '16px', maxWidth: '720px', width: '100%',
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{doc.title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px' }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', color: 'var(--text-main)' }}>
          {renderMarkdown(doc.md)}
        </div>
      </div>
    </div>
  );
}

export function LegalFooter() {
  const [open, setOpen] = useState(null);
  const linkStyle = {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline',
    padding: '4px 6px', fontFamily: 'inherit',
  };
  return (
    <>
      <footer style={{
        padding: '16px 12px 90px 12px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '32px',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 8px' }}>
          <button style={linkStyle} onClick={() => setOpen('legal')}>Mentions légales</button>
          <span aria-hidden>·</span>
          <button style={linkStyle} onClick={() => setOpen('privacy')}>Confidentialité</button>
          <span aria-hidden>·</span>
          <button style={linkStyle} onClick={() => setOpen('terms')}>CGU</button>
        </div>
        <div style={{ marginTop: '6px', opacity: 0.7 }}>
          © {new Date().getFullYear()} Fluent
        </div>
      </footer>
      {open && <LegalDocModal docKey={open} onClose={() => setOpen(null)} />}
    </>
  );
}
