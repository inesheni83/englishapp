import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { authFetch } from '../lib/authFetch.js';
import { levelBandFor } from '../lib/cefr.js';

export function InterviewView({ userLevel, session, targetedPath, onTargetedConsumed, onSwitchToJobCoach }) {
  const [stage, setStage] = useState('setup'); // setup | generating | interview | evaluating | feedback | history
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [interviewType, setInterviewType] = useState('mixed');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [openIdx, setOpenIdx] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isTargeted, setIsTargeted] = useState(false);

  // If a targeted job path is provided, skip the generation step
  // and load the pre-generated questions directly into the interview.
  useEffect(() => {
    if (!targetedPath) return;
    const qs = targetedPath.interview_questions || [];
    if (qs.length === 0) return;
    // Sync external prop -> internal state when a targeted job path is provided
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(qs.map((q, i) => ({ ...q, id: q.id ?? i + 1 })));
    setJobTitle(targetedPath.job_title || '');
    setCompany(targetedPath.company_name || '');
    setInterviewType('targeted');
    setAnswers([]);
    setCurrentQ(0);
    setCurrentAnswer('');
    setFeedback(null);
    setIsTargeted(true);
    setStage('interview');
    if (onTargetedConsumed) onTargetedConsumed();
  }, [targetedPath, onTargetedConsumed]);

  const levelBand = levelBandFor(userLevel);

  const fetchHistory = async () => {
    if (!session?.user) return;
    setStage('history');
    setIsFetchingHistory(true);
    try {
      const { data } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setHistoryList(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
    setIsFetchingHistory(false);
  };

  const loadFromHistory = (item) => {
    setQuestions(item.questions);
    setAnswers(item.answers);
    setFeedback(item.feedback);
    setJobTitle(item.job_title);
    setCompany(item.company);
    setInterviewType(item.interview_type);
    setStage('feedback');
  };

  const callGemini = async (prompt) => {
    const res = await authFetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a pure JSON generator. Return only valid JSON, no markdown.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (res.status === 429) throw new Error('RATE_LIMIT');
    if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  };

  const generateInterview = async () => {
    if (!jobTitle.trim() || !company.trim()) return;
    setStage('generating');
    try {
      const typeDesc = {
        hr: 'HR / Soft skills (motivation, teamwork, values)',
        technical: 'Technical (skills, tools, problem-solving, coding practices)',
        mixed: 'Mixed (HR + Technical — realistic full interview)'
      }[interviewType];

      const prompt = `You are a professional HR interviewer at ${company}. Generate a realistic job interview for a "${jobTitle}" position.

      Interview type: ${typeDesc}
      Candidate level: English CEFR ${levelBand} (adjust question vocabulary and complexity to this level)

      Generate exactly 6 interview questions. Questions must be professional, specific to "${jobTitle}" at "${company}", realistic, and progressively harder.

      Return ONLY valid JSON:
      {
        "interviewerName": "First name of the interviewer",
        "companyContext": "One sentence describing ${company} for context",
        "questions": [
          {
            "id": 1,
            "category": "Introduction | Motivation | Technical | Behavioral | Situational | Closing",
            "question": "The full interview question in English",
            "hint": "Short tip in French to help the candidate structure their answer"
          }
        ]
      }`;

      const result = await callGemini(prompt);
      if (result?.questions?.length) {
        setQuestions(result.questions);
        setAnswers([]);
        setCurrentQ(0);
        setCurrentAnswer('');
        setStage('interview');
        window._interviewMeta = { interviewerName: result.interviewerName, companyContext: result.companyContext };
      } else {
        setStage('setup');
        alert('Generation failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setStage('setup');
      if (e.message === 'RATE_LIMIT') {
        alert("Too many requests (Gemini Rate Limit). Please wait about 30-60 seconds before trying again.");
      } else {
        alert("An error occurred during generation. Please try again.");
      }
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, { questionId: questions[currentQ].id, question: questions[currentQ].question, answer: currentAnswer.trim() }];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      generateFeedback(newAnswers);
    }
  };

  const generateFeedback = async (allAnswers) => {
    setStage('evaluating');
    try {
      const answersText = allAnswers.map((a, i) =>
        `Q${i + 1}: ${a.question}\nCandidate answer: "${a.answer}"`
      ).join('\n\n');

      const prompt = `You are a senior HR evaluator at ${company} interviewing a "${jobTitle}" candidate.
      The candidate speaks English at CEFR level ${levelBand}.

      Evaluate the following interview Q&A. Be professional, constructive, and adapt feedback to their English level.

      ${answersText}

      Return ONLY valid JSON:
      {
        "overallScore": 72,
        "overallComment": "2-3 sentences global English feedback in French",
        "strengths": ["strength 1 in French", "strength 2 in French"],
        "improvements": ["improvement 1 in French", "improvement 2 in French"],
        "answers": [
          {
            "questionId": 1,
            "score": 75,
            "englishFeedback": "Specific feedback on English grammar, vocabulary, fluency in French (2-3 sentences)",
            "contentFeedback": "Feedback on the content/substance of the answer in French (1-2 sentences)",
            "modelAnswer": "A complete, ideal English answer to this question (3-5 sentences, at ${levelBand} level)"
          }
        ]
      }`;

      const result = await callGemini(prompt);
      if (result) {
        setFeedback(result);
        setStage('feedback');

        // Save to Supabase
        if (session?.user) {
          try {
            await supabase.from('interviews').insert({
              user_id: session.user.id,
              job_title: jobTitle,
              company: company,
              interview_type: interviewType,
              questions: questions,
              answers: allAnswers,
              feedback: result
            });
          } catch (dbErr) {
            console.error("Error saving interview to DB:", dbErr);
          }
        }
      } else {
        setStage('interview');
        alert('Feedback generation failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setStage('interview');
      if (e.message === 'RATE_LIMIT') {
        alert("Too many requests (Gemini Rate Limit). Your answers are saved, please wait 60 seconds and click 'Finish' again.");
      } else {
        alert("An error occurred during evaluation. Please try again.");
      }
    }
  };

  const restart = () => {
    setStage('setup');
    setJobTitle('');
    setCompany('');
    setQuestions([]);
    setAnswers([]);
    setCurrentAnswer('');
    setFeedback(null);
    setCurrentQ(0);
    setIsTargeted(false);
  };

  const meta = window._interviewMeta || {};
  const scoreColor = (s) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

  // ─── SETUP ───────────────────────────────────────────────────────────────────
  if (stage === 'setup') return (
    <div>
      <h1 style={{ marginBottom: '4px' }}>🎙️ Interview Simulator</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
        Practise a real job interview with AI. Get personalised feedback on your English and your answers.
      </p>

      {onSwitchToJobCoach && (
        <button
          onClick={onSwitchToJobCoach}
          style={{
            width: '100%', padding: '14px 16px', marginBottom: '20px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: '700' }}>Recommandé</div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', marginTop: '2px' }}>🎯 Préparer un entretien spécifique</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>Avec votre CV et l'offre, questions sur-mesure</div>
          </div>
          <ChevronRight size={20} />
        </button>
      )}

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-main)' }}>📋 Interview Setup</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Job Title / Role
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Senior React Developer, DevOps Engineer, Product Manager..."
            style={{ width: '100%', padding: '12px 14px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Target Company
          </label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Google, Spotify, a Paris startup, BNP Paribas..."
            style={{ width: '100%', padding: '12px 14px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interview Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { key: 'hr', label: '🤝 HR', desc: 'Soft skills & motivation' },
              { key: 'technical', label: '⚙️ Technical', desc: 'Skills & problem solving' },
              { key: 'mixed', label: '🎯 Mixed', desc: 'Full realistic interview' }
            ].map(t => (
              <button key={t.key} onClick={() => setInterviewType(t.key)} style={{
                padding: '10px 8px', borderRadius: '10px', border: `2px solid ${interviewType === t.key ? 'var(--primary)' : 'var(--border-color)'}`,
                background: interviewType === t.key ? '#EEF2FF' : 'white', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: interviewType === t.key ? 'var(--primary)' : 'var(--text-main)' }}>{t.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '16px', fontSize: '0.85rem', color: '#065F46' }}>
          🎯 Adapted to your level: <strong>{userLevel || 'B1'}</strong> — Questions and feedback will match your English proficiency.
        </div>

        <button
          onClick={generateInterview}
          disabled={!jobTitle.trim() || !company.trim()}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1rem', opacity: (!jobTitle.trim() || !company.trim()) ? 0.5 : 1, cursor: (!jobTitle.trim() || !company.trim()) ? 'not-allowed' : 'pointer', marginBottom: '12px' }}
        >
          🚀 Start Interview Simulation
        </button>

        <button
          onClick={fetchHistory}
          className="btn btn-outline"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          🕒 View Past Interviews
        </button>
      </div>
    </div>
  );

  // ─── GENERATING ──────────────────────────────────────────────────────────────
  if (stage === 'generating') return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>🤖</div>
      <h2 style={{ marginBottom: '8px' }}>Preparing your interview...</h2>
      <p style={{ color: 'var(--text-muted)' }}>Generating real questions for <strong>{jobTitle}</strong> at <strong>{company}</strong></p>
    </div>
  );

  // ─── EVALUATING ──────────────────────────────────────────────────────────────
  if (stage === 'evaluating') return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
      <h2 style={{ marginBottom: '8px' }}>Analysing your answers...</h2>
      <p style={{ color: 'var(--text-muted)' }}>Your English and content are being evaluated by AI.</p>
    </div>
  );

  // ─── INTERVIEW ───────────────────────────────────────────────────────────────
  if (stage === 'interview') {
    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;
    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', margin: 0 }}>Interview: {jobTitle}</h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@ {company}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Question <strong>{currentQ + 1}</strong> / {questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', marginBottom: '20px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
        </div>

        {/* Category badge */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', background: '#EEF2FF', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {q.category}
          </span>
          {isTargeted && (
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎯 Mode ciblé
            </span>
          )}
        </div>

        {/* Interviewer bubble */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 }}>
            {(meta.interviewerName || 'AI').charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>
              {meta.interviewerName || 'Interviewer'} · {company}
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0 12px 12px 12px', padding: '14px 16px', fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: '500' }}>
              {q.question}
            </div>
            {q.hint && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#B45309', background: '#FFFBEB', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                💡 {q.hint}
              </div>
            )}
          </div>
        </div>

        {/* Previous answers (mini recap) */}
        {answers.length > 0 && (
          <div style={{ marginBottom: '16px', maxHeight: '120px', overflowY: 'auto', background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px' }}>
            {answers.slice(-2).map((a, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong>Q{answers.length - 1 + i}:</strong> {a.answer.substring(0, 80)}{a.answer.length > 80 ? '...' : ''}
              </div>
            ))}
          </div>
        )}

        {/* Answer input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Your answer (in English):
          </label>
          <textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer in English..."
            rows={5}
            style={{ width: '100%', padding: '12px 14px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.5' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <button
          onClick={submitAnswer}
          disabled={!currentAnswer.trim()}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: !currentAnswer.trim() ? 0.5 : 1, cursor: !currentAnswer.trim() ? 'not-allowed' : 'pointer' }}
        >
          {currentQ < questions.length - 1 ? `Next Question →` : `Finish & Get Feedback 🏁`}
        </button>
      </div>
    );
  }

  // ─── FEEDBACK ────────────────────────────────────────────────────────────────
  if (stage === 'feedback' && feedback) {
    const overallColor = scoreColor(feedback.overallScore);
    return (
      <div>
        <h1 style={{ marginBottom: '4px' }}>📊 Interview Feedback</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>{jobTitle} @ {company}</p>

        {/* Overall score */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '16px', background: `linear-gradient(135deg, ${overallColor}15, ${overallColor}05)`, border: `2px solid ${overallColor}30` }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '900', color: overallColor, lineHeight: 1 }}>{feedback.overallScore}</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>/ 100</div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{feedback.overallComment}</p>
        </div>

        {/* Strengths & Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontWeight: '700', color: '#065F46', marginBottom: '8px', fontSize: '0.85rem' }}>✅ Strengths</div>
            {(feedback.strengths || []).map((s, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#047857', marginBottom: '4px' }}>• {s}</div>
            ))}
          </div>
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontWeight: '700', color: '#9A3412', marginBottom: '8px', fontSize: '0.85rem' }}>🔧 To Improve</div>
            {(feedback.improvements || []).map((s, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#C2410C', marginBottom: '4px' }}>• {s}</div>
            ))}
          </div>
        </div>

        {/* Per-question feedback */}
        <h2 style={{ fontSize: '1rem', marginBottom: '12px' }}>Question-by-Question Analysis</h2>
        {(feedback.answers || []).map((fa, idx) => {
          const q = answers[idx];
          const sc = fa.score || 0;
          return (
            <div key={idx} style={{ marginBottom: '10px', border: `1px solid ${scoreColor(sc)}30`, borderRadius: '12px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: `${scoreColor(sc)}08`, border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px' }}>Q{idx + 1}: {questions[idx]?.category}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q?.question?.substring(0, 60)}...</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', color: scoreColor(sc) }}>{sc}</div>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: openIdx === idx ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </div>
              </button>
              {openIdx === idx && (
                <div style={{ padding: '14px 16px', borderTop: '1px solid #F1F5F9' }}>
                  {/* User answer */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Your Answer</div>
                    <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', fontStyle: 'italic' }}>
                      "{q?.answer}"
                    </div>
                  </div>
                  {/* English feedback */}
                  <div style={{ marginBottom: '10px', padding: '10px 12px', background: '#FFF7ED', borderRadius: '8px', borderLeft: '3px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#B45309', marginBottom: '4px', textTransform: 'uppercase' }}>🗣️ English Feedback</div>
                    <div style={{ fontSize: '0.88rem', color: '#92400E', lineHeight: '1.5' }}>{fa.englishFeedback}</div>
                  </div>
                  {/* Content feedback */}
                  <div style={{ marginBottom: '10px', padding: '10px 12px', background: '#EFF6FF', borderRadius: '8px', borderLeft: '3px solid #3B82F6' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1D4ED8', marginBottom: '4px', textTransform: 'uppercase' }}>💡 Content Feedback</div>
                    <div style={{ fontSize: '0.88rem', color: '#1E3A5F', lineHeight: '1.5' }}>{fa.contentFeedback}</div>
                  </div>
                  {/* Model answer */}
                  <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#065F46', marginBottom: '6px', textTransform: 'uppercase' }}>✨ Model Answer (English)</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857', lineHeight: '1.6' }}>{fa.modelAnswer}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={restart} className="btn btn-outline" style={{ width: '100%', marginTop: '20px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> {historyList.length > 0 ? "Back to History" : "New Interview"}
        </button>
      </div>
    );
  }

  // ─── HISTORY ────────────────────────────────────────────────────────────────
  if (stage === 'history') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setStage('setup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} style={{ transform: 'rotate(-90deg)' }} />
        </button>
        <h1 style={{ margin: 0 }}>🕒 Interview History</h1>
      </div>

      {isFetchingHistory ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading your history...</div>
      ) : historyList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No interviews performed yet.</p>
          <button onClick={() => setStage('setup')} className="btn btn-primary" style={{ marginTop: '12px' }}>Start your first one</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyList.map(item => {
            const date = new Date(item.created_at).toLocaleDateString();
            const score = item.feedback?.overallScore || 0;
            return (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="card"
                style={{ textAlign: 'left', padding: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>{item.job_title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.company} · {date}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: '#F1F5F9', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      {item.interview_type}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '1.4rem', color: scoreColor(score), lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Score</div>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return null;
}
