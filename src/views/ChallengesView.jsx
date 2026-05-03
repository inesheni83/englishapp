import { useState } from 'react';
import { Mic } from 'lucide-react';
import { authFetch } from '../lib/authFetch.js';
import { levelBandFor } from '../lib/cefr.js';

export function ChallengesView({
  userLevel,
  session,
  generatedContent,
  setGeneratedContent,
  updateProgress,
  activeDay,
  challengeStreak,
  setChallengeStreak,
  setTodayChallengeCompleted,
}) {
  const today = new Date().toISOString().split('T')[0];
  const challenges = generatedContent?.challenges || {};
  const todayResult = challenges[today] || null;

  const [stage, setStage] = useState(todayResult ? 'result' : 'idle'); // idle | loading | answering | evaluating | result
  const [challenge, setChallenge] = useState(todayResult?.challenge || null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState(todayResult?.evaluation || null);
  const [errorMsg, setErrorMsg] = useState('');

  const levelBand = levelBandFor(userLevel);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(prev => (prev ? prev + ' ' : '') + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const generateChallenge = async () => {
    setStage('loading');
    setErrorMsg('');
    try {
      // Seed pseudo-aléatoire basé sur la date pour varier les défis chaque jour
      const seed = today + (session?.user?.id || 'guest');

      const prompt = `You are an English teacher creating a DAILY translation challenge for a francophone web engineer at CEFR level ${levelBand}.

Generate ONE realistic, professional French sentence (work context: tech, meetings, code review, deployment, sprint, client communication, etc.) that the user must translate into English.

CONSTRAINTS:
- The French sentence must be challenging but appropriate for ${levelBand} (15-25 words).
- Topic must rotate: pick a random workplace situation (do NOT always use deployment).
- Provide a realistic context (1 short line) so the translation makes sense.
- Provide ONE ideal English translation (the model answer).
- Provide 2-3 key vocabulary or grammar tips in French to guide the user BEFORE they answer.
- Use the seed "${seed}" to vary the topic.

Return ONLY valid JSON:
{
  "frenchSentence": "La phrase française à traduire.",
  "context": "Short context in French (e.g., 'Vous écrivez à votre Tech Lead à propos d'un bug en production.').",
  "modelAnswer": "The ideal English translation.",
  "tips": ["Tip 1 in French", "Tip 2 in French", "Tip 3 in French"]
}`;

      const res = await authFetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a pure JSON generator. Return only valid JSON, no markdown.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.status === 429) throw new Error('RATE_LIMIT');
      if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : null;

      if (!parsed?.frenchSentence) throw new Error('PARSE_ERROR');

      setChallenge(parsed);
      setStage('answering');
    } catch (e) {
      console.error('Challenge generation failed:', e);
      setStage('idle');
      if (e.message === 'RATE_LIMIT') {
        setErrorMsg("Trop de requêtes. Réessayez dans 30-60 secondes.");
      } else {
        setErrorMsg("La génération a échoué. Réessayez dans un instant.");
      }
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !challenge) return;
    setStage('evaluating');
    setErrorMsg('');

    try {
      const prompt = `You are an English evaluator for a francophone learner at CEFR level ${levelBand}.

The learner had to translate this French sentence into English:
French: "${challenge.frenchSentence}"
Context: ${challenge.context}
Ideal English translation (reference): "${challenge.modelAnswer}"

The learner's answer:
"${userAnswer.trim()}"

Evaluate fairly for a ${levelBand} learner. A perfect translation does not have to be word-for-word identical to the reference — only meaning, grammar and natural English matter.

Return ONLY valid JSON:
{
  "score": 0-100 integer,
  "verdict": "perfect | good | needs_work | poor",
  "shortFeedback": "One short sentence in French summarising the result.",
  "grammarNotes": "Specific grammar/vocab corrections in French (1-3 sentences). Empty string if perfect.",
  "improvedAnswer": "An improved version of the learner's answer keeping their style when possible."
}`;

      const res = await authFetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a pure JSON generator. Return only valid JSON, no markdown.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (res.status === 429) throw new Error('RATE_LIMIT');
      if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : null;

      if (!parsed || typeof parsed.score !== 'number') throw new Error('PARSE_ERROR');

      setEvaluation(parsed);

      // Persist result + update streak
      const passed = parsed.score >= 60;
      const newChallenges = {
        ...challenges,
        [today]: {
          challenge,
          userAnswer: userAnswer.trim(),
          evaluation: parsed,
          completedAt: new Date().toISOString(),
        },
      };

      // Recompute streak from today backwards
      let newStreak = 0;
      let checkDate = today;
      while (newChallenges[checkDate] && (newChallenges[checkDate].evaluation?.score ?? 0) >= 60) {
        newStreak++;
        checkDate = new Date(new Date(checkDate) - 86400000).toISOString().split('T')[0];
      }

      // If user failed today (< 60), do NOT count today in streak (newStreak above handles it correctly)
      const updatedContent = { ...generatedContent, challenges: newChallenges };
      setGeneratedContent(updatedContent);
      setChallengeStreak(passed ? newStreak : 0);
      setTodayChallengeCompleted(true);
      updateProgress(activeDay, updatedContent);

      setStage('result');
    } catch (e) {
      console.error('Challenge evaluation failed:', e);
      setStage('answering');
      if (e.message === 'RATE_LIMIT') {
        setErrorMsg("Trop de requêtes. Réessayez dans 30-60 secondes.");
      } else {
        setErrorMsg("L'évaluation a échoué. Réessayez.");
      }
    }
  };

  const verdictMeta = (v) => ({
    perfect: { color: '#10B981', bg: '#ECFDF5', emoji: '🌟', label: 'Excellent !' },
    good: { color: '#10B981', bg: '#ECFDF5', emoji: '✅', label: 'Bien joué !' },
    needs_work: { color: '#F59E0B', bg: '#FFFBEB', emoji: '⚠️', label: 'Presque !' },
    poor: { color: '#EF4444', bg: '#FEF2F2', emoji: '❌', label: 'À retravailler' },
  }[v] || { color: '#6B7280', bg: '#F3F4F6', emoji: '📝', label: '' });

  // ─── RESULT (already done today or just finished) ──────────────────────────
  if (stage === 'result' && evaluation && challenge) {
    const meta = verdictMeta(evaluation.verdict);
    return (
      <div>
        <h1 style={{ marginBottom: '4px' }}>🎯 Daily Challenge</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Votre défi du {new Date(today).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          color: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, marginBottom: '4px' }}>Streak</div>
          <div style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1 }}>🔥 {challengeStreak}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>{challengeStreak > 1 ? 'jours consécutifs' : 'jour'}</div>
        </div>

        <div className="card" style={{ marginBottom: '16px', background: meta.bg, borderLeft: `4px solid ${meta.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>{meta.emoji}</span>
              <strong style={{ color: meta.color }}>{meta.label}</strong>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: meta.color }}>{evaluation.score}<span style={{ fontSize: '0.9rem' }}>/100</span></div>
          </div>
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.92rem' }}>{evaluation.shortFeedback}</p>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Phrase à traduire</div>
          <p style={{ margin: '0 0 16px 0', fontSize: '1rem', fontStyle: 'italic' }}>« {challenge.frenchSentence} »</p>

          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Votre réponse</div>
          <p style={{ margin: '0 0 16px 0', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.95rem' }}>{todayResult?.userAnswer || userAnswer}</p>

          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Version améliorée</div>
          <p style={{ margin: '0 0 16px 0', padding: '10px 12px', background: '#ECFDF5', borderRadius: '8px', fontSize: '0.95rem', color: '#065F46' }}>{evaluation.improvedAnswer}</p>

          {evaluation.grammarNotes && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Notes du coach</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{evaluation.grammarNotes}</p>
            </>
          )}
        </div>

        <div style={{ padding: '12px', background: '#EEF2FF', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem', color: '#3730A3' }}>
          💡 Revenez demain pour un nouveau défi et garder votre streak !
        </div>
      </div>
    );
  }

  // ─── ANSWERING ───────────────────────────────────────────────────────────────
  if (stage === 'answering' && challenge) {
    return (
      <div>
        <h1 style={{ marginBottom: '4px' }}>🎯 Daily Challenge</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Traduisez en anglais — environ 2 minutes
        </p>

        <div className="card" style={{ marginBottom: '16px', background: '#FFFBEB', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400E', marginBottom: '6px' }}>Contexte</div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350F' }}>{challenge.context}</p>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>À traduire</div>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>« {challenge.frenchSentence} »</p>
        </div>

        {challenge.tips?.length > 0 && (
          <div className="card" style={{ marginBottom: '16px', background: '#EEF2FF' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3730A3', marginBottom: '8px' }}>💡 Pistes</div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#3730A3' }}>
              {challenge.tips.map((t, i) => <li key={i} style={{ marginBottom: '4px' }}>{t}</li>)}
            </ul>
          </div>
        )}

        <div className="card" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Votre traduction</label>
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Type your English translation..."
            rows={4}
            style={{ width: '100%', padding: '12px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={startRecording}
              disabled={isRecording}
              style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '10px', border: '2px solid var(--border-color)', background: isRecording ? '#FEE2E2' : 'white', color: isRecording ? '#EF4444' : 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600' }}
              title="Dicter votre réponse"
            >
              <Mic size={16} /> {isRecording ? 'Recording...' : 'Speak'}
            </button>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim()}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px', fontSize: '0.95rem', opacity: userAnswer.trim() ? 1 : 0.5, cursor: userAnswer.trim() ? 'pointer' : 'not-allowed' }}
            >
              Submit Answer
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px', background: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem' }}>{errorMsg}</div>
        )}
      </div>
    );
  }

  // ─── EVALUATING ──────────────────────────────────────────────────────────────
  if (stage === 'evaluating' || stage === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{stage === 'loading' ? '🎲' : '🧠'}</div>
        <h2 style={{ marginBottom: '8px' }}>{stage === 'loading' ? 'Génération du défi...' : 'Évaluation en cours...'}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quelques secondes seulement.</p>
      </div>
    );
  }

  // ─── IDLE (no challenge today yet) ───────────────────────────────────────────
  return (
    <div>
      <h1 style={{ marginBottom: '4px' }}>🎯 Daily Challenge</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
        2 minutes par jour pour entretenir votre anglais pro.
      </p>

      <div className="card" style={{
        marginBottom: '16px',
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        color: 'white',
        textAlign: 'center',
        padding: '28px 20px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔥</div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, marginBottom: '4px' }}>Streak actuelle</div>
        <div style={{ fontSize: '2.4rem', fontWeight: '900', lineHeight: 1 }}>{challengeStreak}</div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '6px' }}>
          {challengeStreak === 0 ? 'Commencez aujourd\'hui !' : challengeStreak === 1 ? 'jour' : 'jours consécutifs'}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px' }}>Comment ça marche ?</h2>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.7' }}>
          <li>Une phrase pro francophone à traduire en anglais</li>
          <li>Adaptée à votre niveau ({userLevel || 'B1'})</li>
          <li>L'IA évalue votre réponse et suggère une amélioration</li>
          <li>Un score ≥ 60 maintient votre streak 🔥</li>
        </ul>
      </div>

      <button
        onClick={generateChallenge}
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
      >
        🚀 Lancer le défi du jour
      </button>

      {errorMsg && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem' }}>{errorMsg}</div>
      )}
    </div>
  );
}
