import { useEffect, useState } from 'react';
import { Volume2, ChevronDown } from 'lucide-react';
import { dialogues, discussionExpressions } from '../data.js';

export function LearnView({ activeDay, appContent, setActiveTab, dayTestLevel, setCurrentTestLevel, advancedContent, generateAdvancedContent, isGeneratingAdvanced, userLevel }) {
  const [showAllVocab, setShowAllVocab] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [vocabDone, setVocabDone] = useState(false);
  const [grammarDone, setGrammarDone] = useState(false);
  const [expressionsDone, setExpressionsDone] = useState(false);
  const [dialogueDone, setDialogueDone] = useState(false);
  const [openSection, setOpenSection] = useState({ vocab: false, grammar: false, expressions: false, dialogue: false });

  const toggleSection = (key) => setOpenSection(prev => ({ ...prev, [key]: !prev[key] }));

  const allDone = vocabDone && grammarDone && expressionsDone && dialogueDone;
  const dayLevel = dayTestLevel?.[activeDay];

  const handleStartTest = (level) => {
    setCurrentTestLevel(level);
    setActiveTab('test');
  };

  const handleSelectAdvanced = () => {
    const baseData = appContent[activeDay] || appContent[1];
    if (!advancedContent[activeDay]) {
      generateAdvancedContent(activeDay, baseData.title, baseData);
    }
    setSelectedLevel('advanced');
    setVocabDone(false);
    setGrammarDone(false);
    setExpressionsDone(false);
    setDialogueDone(false);
    setOpenSection({ vocab: false, grammar: false, expressions: false, dialogue: false });
  };

  const handleSelectIntermediate = () => {
    setSelectedLevel('intermediate');
    setVocabDone(false);
    setGrammarDone(false);
    setExpressionsDone(false);
    setDialogueDone(false);
    setOpenSection({ vocab: false, grammar: false, expressions: false, dialogue: false });
  };

  useEffect(() => {
    // Reset section progress when the user navigates to another day
    /* eslint-disable react-hooks/set-state-in-effect */
    setVocabDone(false);
    setGrammarDone(false);
    setExpressionsDone(false);
    setDialogueDone(false);
    setSelectedLevel('intermediate');
    setOpenSection({ vocab: false, grammar: false, expressions: false, dialogue: false });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [activeDay]);

  const speakExample = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const baseData = appContent[activeDay] || appContent[1];
  const advData = advancedContent[activeDay];
  const dayData = (selectedLevel === 'advanced' && advData) ? advData : baseData;
  const displayedVocab = showAllVocab ? dayData.vocab : dayData.vocab.slice(0, 4);

  const startIndex = ((activeDay - 1) % 3) * 10;
  const dayExpressions = dayData.expressions || discussionExpressions.slice(startIndex, startIndex + 10);
  const dayDialogue = dayData.dialogue || (dialogues[(activeDay - 1) % dialogues.length].lines);

  return (
    <div>
      <h1 style={{ marginBottom: '4px' }}>Day {activeDay}: {baseData.title}</h1>
      <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose your learning level below.</p>

      {/* Level Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#F1F5F9', padding: '6px', borderRadius: '12px' }}>
        <button
          onClick={handleSelectIntermediate}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
            background: selectedLevel === 'intermediate' ? 'white' : 'transparent',
            color: selectedLevel === 'intermediate' ? '#B45309' : 'var(--text-muted)',
            boxShadow: selectedLevel === 'intermediate' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🟡 Intermediate
        </button>
        <button
          onClick={() => dayLevel === 'intermediate' || dayLevel === 'advanced' ? handleSelectAdvanced() : null}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
            cursor: (dayLevel === 'intermediate' || dayLevel === 'advanced') ? 'pointer' : 'not-allowed',
            fontWeight: '700', fontSize: '0.9rem',
            background: selectedLevel === 'advanced' ? 'white' : 'transparent',
            color: selectedLevel === 'advanced' ? 'var(--primary)' : (dayLevel === 'intermediate' || dayLevel === 'advanced') ? '#4F46E5' : '#94A3B8',
            boxShadow: selectedLevel === 'advanced' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🔴 Advanced {!(dayLevel === 'intermediate' || dayLevel === 'advanced') ? '🔒' : (userLevel ? `· ${userLevel.split(' ')[0]}+` : '')}
        </button>
      </div>

      {/* Advanced — loading state */}
      {selectedLevel === 'advanced' && isGeneratingAdvanced && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✨</div>
          <p style={{ fontWeight: '600' }}>Generating your Advanced {userLevel ? `(${userLevel.split(' ')[0]}+)` : ''} content with AI...</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Tailored specifically to your level. This may take a few seconds.</p>
        </div>
      )}

      {/* Advanced — not yet unlocked */}
      {selectedLevel === 'advanced' && !advData && !isGeneratingAdvanced && !(dayLevel === 'intermediate' || dayLevel === 'advanced') && (
        <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '12px', border: '2px dashed #E2E8F0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
          <p style={{ fontWeight: '600' }}>Pass the Intermediate Test first to unlock Advanced content.</p>
        </div>
      )}

      {/* Content (shown when data is available for selected level) */}
      {(selectedLevel === 'intermediate' || (selectedLevel === 'advanced' && advData && !isGeneratingAdvanced)) && (
      <>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button onClick={() => toggleSection('vocab')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: vocabDone ? '#ECFDF5' : 'white', border: 'none', cursor: 'pointer', borderBottom: openSection.vocab ? '1px solid var(--border-color)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>📚</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Vocabulary for Web Engineers</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>15 words &amp; technical expressions</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {vocabDone && <span style={{ fontSize: '1rem' }}>✅</span>}
            <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: openSection.vocab ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
          </div>
        </button>
        {openSection.vocab && (
          <div style={{ padding: '16px 20px' }}>
        {displayedVocab.map((v, i) => (
          <div key={i} className="vocab-item" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <div className="vocab-word">{v.word}</div>
                <div className="vocab-translation">{v.translation}</div>
              </div>
              <div className="vocab-category">{v.category}</div>
            </div>
            {v.example && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div className="vocab-example" style={{ margin: 0, flex: 1 }}>"{v.example}"</div>
                  <button
                    onClick={() => speakExample(v.example)}
                    style={{ background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '50%', transition: 'all 0.2s', flexShrink: 0 }}
                    title="Listen to pronunciation"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                {v.exampleTranslation && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                    {v.exampleTranslation}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '16px' }}
          onClick={() => setShowAllVocab(!showAllVocab)}
        >
          {showAllVocab ? 'Show Less' : 'View All 15 Words'}
        </button>
        <div style={{ marginTop: '24px', padding: '16px', background: vocabDone ? '#ECFDF5' : '#F1F5F9', borderRadius: '8px', border: `1px solid ${vocabDone ? '#10B981' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setVocabDone(!vocabDone)}>
          <input type="checkbox" checked={vocabDone} readOnly style={{ transform: 'scale(1.5)' }} />
          <span style={{ fontWeight: '600', color: vocabDone ? '#065F46' : '#475569' }}>J'ai mémorisé ce vocabulaire</span>
        </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button onClick={() => toggleSection('grammar')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: grammarDone ? '#ECFDF5' : 'white', border: 'none', cursor: 'pointer', borderBottom: openSection.grammar ? '1px solid var(--border-color)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>📝</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Grammar Focus</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>{dayData.grammarTitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {grammarDone && <span style={{ fontSize: '1rem' }}>✅</span>}
            <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: openSection.grammar ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
          </div>
        </button>
        {openSection.grammar && (
          <div style={{ padding: '16px 20px' }}>

        <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--primary)' }}>Quand l'utiliser ?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {dayData.grammarDesc}
          </p>
        </div>

        <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #F59E0B' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#B45309', marginBottom: '4px' }}>Syntaxe</h3>
          <code style={{ fontSize: '0.95rem', color: '#92400E', fontWeight: 'bold' }}>{dayData.grammarSyntax}</code>
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Exemples utiles pour l'ingénierie :</h3>
        <div className="grammar-rule">
          {dayData.grammarRules.map((rule, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '4px' }}>{rule.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div className="grammar-example" style={{ margin: 0, flex: 1 }}>{rule.example}</div>
                <button
                  onClick={() => speakExample(rule.example)}
                  style={{ background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '50%', transition: 'all 0.2s', flexShrink: 0 }}
                  title="Listen to pronunciation"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '12px' }}>{rule.translation || rule.explanation}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '24px', padding: '16px', background: grammarDone ? '#ECFDF5' : '#F1F5F9', borderRadius: '8px', border: `1px solid ${grammarDone ? '#10B981' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setGrammarDone(!grammarDone)}>
          <input type="checkbox" checked={grammarDone} readOnly style={{ transform: 'scale(1.5)' }} />
          <span style={{ fontWeight: '600', color: grammarDone ? '#065F46' : '#475569' }}>J'ai compris cette règle de grammaire</span>
        </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button onClick={() => toggleSection('expressions')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: expressionsDone ? '#ECFDF5' : 'white', border: 'none', cursor: 'pointer', borderBottom: openSection.expressions ? '1px solid var(--border-color)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>💼</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Workplace Expressions</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>10 must-know expressions</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {expressionsDone && <span style={{ fontSize: '1rem' }}>✅</span>}
            <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: openSection.expressions ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
          </div>
        </button>
        {openSection.expressions && (
          <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dayExpressions.map((exp, idx) => {
            const phrase = exp.phrase || exp.expression;
            const meaning = exp.meaning || exp.description || exp.context;
            const exampleRaw = exp.example || `"${phrase}"` ;
            const translation = exp.translation;
            const color = exp.color || '#4F46E5';
            const category = exp.category;
            // Highlight the phrase in the example sentence
            const exampleHighlighted = exampleRaw.includes(phrase)
              ? exampleRaw.replace(phrase, `<strong style="color:${color}">${phrase}</strong>`)
              : `<strong style="color:${color}">${phrase}</strong> — ${exampleRaw}`;

            return (
              <div key={idx} style={{
                background: `${color}10`,
                border: `1.5px solid ${color}33`,
                borderLeft: `4px solid ${color}`,
                borderRadius: '12px',
                padding: '14px 16px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    {category && (
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: color,
                        background: `${color}18`,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        marginBottom: '8px'
                      }}>{category}</span>
                    )}
                    <div style={{ fontWeight: '700', fontSize: '1.05rem', color: color, marginBottom: '6px' }}>
                      {phrase}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px', lineHeight: '1.5' }}
                      dangerouslySetInnerHTML={{ __html: `🗣️ ${exampleHighlighted}` }}
                    />
                    {translation && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {translation}
                      </div>
                    )}
                    {meaning && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        💡 {meaning}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => speakExample(exampleRaw)}
                    style={{ background: `${color}20`, border: 'none', color: color, cursor: 'pointer', padding: '8px', borderRadius: '50%', flexShrink: 0 }}
                    title="Listen"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '16px', padding: '16px', background: expressionsDone ? '#ECFDF5' : '#F1F5F9', borderRadius: '8px', border: `1px solid ${expressionsDone ? '#10B981' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setExpressionsDone(!expressionsDone)}>
          <input type="checkbox" checked={expressionsDone} readOnly style={{ transform: 'scale(1.5)' }} />
          <span style={{ fontWeight: '600', color: expressionsDone ? '#065F46' : '#475569' }}>J'ai appris ces expressions</span>
        </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button onClick={() => toggleSection('dialogue')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: dialogueDone ? '#ECFDF5' : 'white', border: 'none', cursor: 'pointer', borderBottom: openSection.dialogue ? '1px solid var(--border-color)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>💬</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Workplace Dialogue</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-world conversation to study</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {dialogueDone && <span style={{ fontSize: '1rem' }}>✅</span>}
            <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: openSection.dialogue ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
          </div>
        </button>
        {openSection.dialogue && (
          <div style={{ padding: '16px 20px' }}>
        <div className="dialogue-chat">
          {dayDialogue.map((line, idx) => {
            const isA = line.speaker === 'A' || (line.speaker && (line.speaker.includes('Mark') || line.speaker.includes('Alex') || line.speaker.includes('James') || line.speaker.includes('PM')));
            const bubbleClass = isA ? 'bubble-a' : 'bubble-b';
            const avatarClass = isA ? 'avatar-a' : 'avatar-b';
            const avatarLabel = (line.speaker || '?').charAt(0).toUpperCase();
            return (
              <div key={idx} className={`dialogue-bubble-row ${isA ? 'row-a' : 'row-b'}`}>
                <div className={`dialogue-avatar ${avatarClass}`}>{avatarLabel}</div>
                <div className={`dialogue-bubble ${bubbleClass}`}>
                  <span className="bubble-speaker">{line.speaker}</span>
                  <div className="bubble-text">
                    <span className="bubble-english">{line.text}</span>
                    <button className="bubble-audio-btn" onClick={() => speakExample(line.text)} title="Listen">
                      <Volume2 size={13} />
                    </button>
                    {line.translation && <p className="bubble-french">{line.translation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '16px', padding: '16px', background: dialogueDone ? '#ECFDF5' : '#F1F5F9', borderRadius: '8px', border: `1px solid ${dialogueDone ? '#10B981' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setDialogueDone(!dialogueDone)}>
          <input type="checkbox" checked={dialogueDone} readOnly style={{ transform: 'scale(1.5)' }} />
          <span style={{ fontWeight: '600', color: dialogueDone ? '#065F46' : '#475569' }}>J'ai lu et compris ce dialogue</span>
        </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>🎯 Daily Tests</h3>
        {dayLevel === 'advanced' ? (
          <div style={{ textAlign: 'center', padding: '20px', background: '#ECFDF5', borderRadius: '12px', border: '2px solid #10B981' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontWeight: '700', color: '#065F46', fontSize: '1.1rem' }}>Day {activeDay} Fully Completed!</div>
            <div style={{ fontSize: '0.9rem', color: '#047857', marginTop: '4px' }}>Next day unlocked. Keep it up!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Intermediate Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => allDone && !dayLevel && handleStartTest('intermediate')}
                style={{
                  width: '100%', padding: '16px', fontSize: '1rem', textAlign: 'left',
                  background: dayLevel === 'intermediate' ? '#FFFBEB' : (allDone && !dayLevel ? '#FFFBEB' : '#F8FAFC'),
                  border: `2px solid ${dayLevel === 'intermediate' ? '#F59E0B' : (allDone && !dayLevel ? '#F59E0B' : '#E2E8F0')}`,
                  borderRadius: '12px', cursor: allDone && !dayLevel ? 'pointer' : 'not-allowed',
                  opacity: dayLevel === 'intermediate' ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#B45309', fontSize: '1rem' }}>🟡 Intermediate Test</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {!allDone ? '🔒 Complete the lesson first' : (dayLevel === 'intermediate' ? '✅ Passed — unlock Advanced' : 'Translation → Word · Warm-up')}
                    </div>
                  </div>
                  {dayLevel === 'intermediate' && <span style={{ fontSize: '1.5rem' }}>✅</span>}
                  {!allDone && <span style={{ fontSize: '1.3rem' }}>🔒</span>}
                </div>
              </button>
            </div>

            {/* Advanced Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => dayLevel === 'intermediate' && handleStartTest('advanced')}
                style={{
                  width: '100%', padding: '16px', fontSize: '1rem', textAlign: 'left',
                  background: dayLevel === 'intermediate' ? '#EEF2FF' : '#F8FAFC',
                  border: `2px solid ${dayLevel === 'intermediate' ? '#4F46E5' : '#E2E8F0'}`,
                  borderRadius: '12px', cursor: dayLevel === 'intermediate' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: dayLevel === 'intermediate' ? 'var(--primary)' : '#94A3B8', fontSize: '1rem' }}>
                      🔴 Advanced Test
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {dayLevel === 'intermediate' ? '✨ Pass this to unlock next day!' : '🔒 Pass Intermediate first'}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.3rem' }}>{dayLevel === 'intermediate' ? '🔓' : '🔒'}</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
      </> )} {/* end content conditional */}
    </div>
  );
}
