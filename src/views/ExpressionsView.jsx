import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { discussionExpressions } from '../data.js';

export function ExpressionsView() {
  const [activeFilter, setActiveFilter] = useState('All');

  const speakExpression = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const categories = ["All", ...new Set(discussionExpressions.map(e => e.category))];

  const filteredExpressions = activeFilter === 'All'
    ? discussionExpressions
    : discussionExpressions.filter(e => e.category === activeFilter);

  return (
    <div style={{ paddingBottom: '30px' }}>
      <h1 style={{ marginBottom: '8px' }}>Discussion Expressions</h1>
      <p style={{ marginBottom: '24px' }}>Essential phrases to facilitate professional conversations.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: activeFilter === cat ? 'var(--primary)' : 'white',
              color: activeFilter === cat ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              fontWeight: activeFilter === cat ? '500' : 'normal'
            }}
          >
            {cat} {cat === 'All' && `(${discussionExpressions.length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredExpressions.map(exp => (
          <div key={exp.id} className="card" style={{ padding: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{exp.id}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{exp.phrase}</strong>
                  <button
                    onClick={() => speakExpression(exp.phrase)}
                    style={{ background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '50%', transition: 'all 0.2s' }}
                    title="Listen to phrase"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: exp.color, flexShrink: 0, marginTop: '6px' }}></div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '16px', flex: 1 }}>
              {exp.description}
            </p>

            <div style={{ borderLeft: '3px solid #e5e7eb', paddingLeft: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', flex: 1 }}>
                  "{exp.example}"
                </div>
                <button
                  onClick={() => speakExpression(exp.example)}
                  style={{ background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '50%', transition: 'all 0.2s', flexShrink: 0, marginTop: '-2px' }}
                  title="Listen to example"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {exp.translation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
