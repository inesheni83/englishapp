import { useState } from 'react';
import { Volume2, Star } from 'lucide-react';
import { dialogues } from '../data.js';

export function DialoguesView() {
  const [activeDialogue, setActiveDialogue] = useState(0);

  const speakDialogue = (dialogue) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = dialogue.lines.map(l => `${l.speaker.replace(/\\(.*\\)/, '')} says: ${l.text}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getInitials = (name) => {
    const cleanName = name.replace(/\\(.*\\)/, '').trim();
    const parts = cleanName.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return cleanName.substring(0, 2).toUpperCase();
  };

  const highlightText = (text, keyExpressions) => {
    let highlightedText = text;
    keyExpressions.forEach(exp => {
      const phraseToHighlight = exp.expression.split('...')[0].trim();
      if (phraseToHighlight.length > 3) {
        const regex = new RegExp(`(${phraseToHighlight})`, 'gi');
        highlightedText = highlightedText.replace(regex, `<mark style="background-color: #ffedd5; color: #9a3412; padding: 2px 4px; border-radius: 4px; font-weight: 500;">$1</mark>`);
      }
    });
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const d = dialogues[activeDialogue];
  if (!d) return null;
  const speakers = [...new Set(d.lines.map(l => l.speaker))];

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h1 style={{ marginBottom: '8px' }}>Situational Dialogues</h1>
      <p style={{ marginBottom: '16px' }}>Listen and learn from real-world tech conversations.</p>

      <div className="day-selector" style={{ marginBottom: '24px' }}>
        {dialogues.map((dlg, idx) => (
          <div
            key={idx}
            className={`day-bubble ${activeDialogue === idx ? 'active' : ''}`}
            onClick={() => setActiveDialogue(idx)}
            title={dlg.title}
          >
            <span style={{ fontSize: '0.65rem' }}>Dial.</span>
            <span>{idx + 1}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '8px' }}>{d.title}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Situation:</strong> {d.situation}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0' }}><strong>Context:</strong> {d.context}</p>
            </div>
            <button
              onClick={() => speakDialogue(d)}
              style={{ background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '50%', transition: 'all 0.2s', flexShrink: 0, marginLeft: '12px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}
              title="Play Full Dialogue"
            >
              <Volume2 size={24} />
            </button>
          </div>
        </div>

        <div style={{ background: '#fafafa', padding: '20px 16px' }}>
          {d.lines.map((l, i) => {
            const isRight = speakers.indexOf(l.speaker) % 2 !== 0;
            const initials = getInitials(l.speaker);
            const cleanName = l.speaker.replace(/\\(.*\\)/, '').trim();

            return (
              <div key={i} style={{ display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: isRight ? '#ece9fc' : '#e4eff8',
                  color: isRight ? '#4F46E5' : '#0284C7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
                }}>
                  {initials}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px', marginLeft: isRight ? '0' : '4px', marginRight: isRight ? '4px' : '0' }}>
                    {cleanName}
                  </div>
                  <div style={{
                    backgroundColor: isRight ? '#e4eff8' : '#f5f4ef',
                    color: isRight ? '#1e3a8a' : '#1f2937',
                    padding: '14px 16px',
                    borderRadius: '20px',
                    borderTopLeftRadius: isRight ? '20px' : '4px',
                    borderTopRightRadius: isRight ? '4px' : '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                      {highlightText(l.text, d.keyExpressions)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: isRight ? '#4b5563' : '#6b7280', fontStyle: 'italic', marginTop: '10px', borderTop: `1px solid ${isRight ? 'rgba(30, 58, 138, 0.1)' : 'rgba(0,0,0,0.05)'}`, paddingTop: '8px' }}>
                      {l.translation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="var(--accent)" /> Key Expressions
          </h3>
          <ul style={{ paddingLeft: '0', fontSize: '0.95rem', color: 'var(--text-main)', listStyle: 'none' }}>
            {d.keyExpressions.map((exp, i) => (
              <li key={i} style={{ marginBottom: '12px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong style={{ color: '#9a3412', backgroundColor: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}>{exp.expression}</strong>
                </div>
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '4px' }}>{exp.translation}</div>
                <div style={{ fontSize: '0.85rem' }}>{exp.explanation}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
