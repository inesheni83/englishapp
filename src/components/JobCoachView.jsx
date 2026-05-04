import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, Briefcase, Award, BookOpen, MessageCircle, RefreshCw, Star } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { authFetch } from '../lib/authFetch.js';
import { describeApiError } from '../lib/apiErrors.js';
import { useToast } from './Toast.jsx';
import { useConfirm } from './ConfirmDialog.jsx';

const MAX_CV_MB = 8;

// Convert a File (PDF) to base64 string (without the data: prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const commaIdx = typeof result === 'string' ? result.indexOf(',') : -1;
      if (commaIdx === -1) return reject(new Error('Invalid file read'));
      resolve(result.slice(commaIdx + 1));
    };
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function severityColor(sev) {
  return { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }[sev] || '#6B7280';
}

const STEP_LABELS = [
  '🔍 Analysing your CV',
  '🧩 Comparing with the job offer',
  '📚 Building your learning path',
  '🎙️ Preparing interview questions',
];

export function JobCoachView({ session, userLevel, onLaunchTargetedInterview }) {
  const toast = useToast();
  const confirm = useConfirm();

  // stage: list | setup | analyzing | dashboard
  const [stage, setStage] = useState('list');
  const [paths, setPaths] = useState([]);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [activePath, setActivePath] = useState(null);

  // setup form
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [offerText, setOfferText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState('');

  // analyzing
  const [analyzeStep, setAnalyzeStep] = useState(0);

  // dashboard
  const [openDay, setOpenDay] = useState(null);
  const [showAllVocab, setShowAllVocab] = useState(false);

  const stepIntervalRef = useRef(null);

  const fetchPaths = async () => {
    if (!session?.user) return;
    setIsFetchingList(true);
    try {
      const { data } = await supabase
        .from('job_paths')
        .select('id, job_title, company_name, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setPaths(data);
    } catch (e) {
      console.error('Failed to fetch job paths:', e);
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    if (stage === 'list') {
      // External I/O (Supabase) -> legitimate effect work
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPaths();
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const openPath = async (id) => {
    try {
      const { data, error } = await supabase
        .from('job_paths')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setActivePath(data);
      setStage('dashboard');
      setOpenDay(null);
    } catch (e) {
      console.error('Failed to load path:', e);
      toast.error("We couldn't open this learning path.");
    }
  };

  const deletePath = async (id) => {
    const ok = await confirm({
      title: 'Delete this learning path?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (!ok) return;
    try {
      await supabase.from('job_paths').delete().eq('id', id);
      setPaths(prev => prev.filter(p => p.id !== id));
      toast.success('Learning path deleted.');
    } catch (e) {
      console.error('Delete failed:', e);
      toast.error("We couldn't delete this learning path.");
    }
  };

  const handleFileChange = async (file) => {
    setCvError('');
    if (!file) return setCvFile(null);
    if (file.type !== 'application/pdf') {
      setCvError('Only PDF files are accepted.');
      return;
    }
    if (file.size > MAX_CV_MB * 1024 * 1024) {
      setCvError(`File too large (max ${MAX_CV_MB} MB).`);
      return;
    }
    setCvFile(file);
  };

  const startAnalysis = async () => {
    if (!jobTitle.trim() || !companyName.trim() || offerText.trim().length < 50) {
      toast.error("Please fill in the role, the company and paste the job offer (at least 50 characters).");
      return;
    }

    setStage('analyzing');
    setAnalyzeStep(0);

    // Animate the step indicator (purely cosmetic - real work is the single API call)
    stepIntervalRef.current = setInterval(() => {
      setAnalyzeStep(s => Math.min(s + 1, STEP_LABELS.length - 1));
    }, 4500);

    try {
      let cvBase64 = null;
      if (cvFile) {
        cvBase64 = await fileToBase64(cvFile);
      }

      const res = await authFetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvBase64,
          offerText: offerText.trim(),
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          userLevel: userLevel || 'B1',
        }),
      });

      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }

      if (res.status === 429) throw new Error('RATE_LIMIT');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP_${res.status}`);
      }

      const analysis = await res.json();

      // Persist to Supabase
      const { data, error } = await supabase
        .from('job_paths')
        .insert({
          user_id: session.user.id,
          job_title: jobTitle.trim(),
          company_name: companyName.trim(),
          offer_text: offerText.trim(),
          cv_summary: analysis.cvSummary || null,
          gap_analysis: analysis.gapAnalysis || [],
          learning_plan: analysis.learningPlan || [],
          interview_questions: analysis.interviewQuestions || [],
          company_briefing: analysis.companyBriefing || '',
          progress: { coreVocabulary: analysis.coreVocabulary || [] },
        })
        .select()
        .single();

      if (error) throw error;

      setActivePath(data);
      setStage('dashboard');
      // Reset form for next time
      setJobTitle('');
      setCompanyName('');
      setOfferText('');
      setCvFile(null);
    } catch (e) {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      console.error('Job analysis failed:', e);
      setStage('setup');
      toast.error(describeApiError(e));
    }
  };

  // ─── LIST: history of generated paths + CTA to create a new one ────────────
  if (stage === 'list') {
    return (
      <div>
        <h1 style={{ marginBottom: '4px' }}>🎯 Job Coach</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          A tailored English path for every job you’re going after.
        </p>

        <button
          onClick={() => setStage('setup')}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1rem', marginBottom: '20px' }}
        >
          + New targeted path
        </button>

        <h2 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700', marginBottom: '12px' }}>
          Your paths
        </h2>

        {isFetchingList ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
        ) : paths.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
            <Briefcase size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No paths yet.<br />Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paths.map(p => (
              <div key={p.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <button onClick={() => openPath(p.id)} style={{ flex: 1, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>{p.job_title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {p.company_name} · {new Date(p.created_at).toLocaleDateString('en-GB')}
                  </div>
                </button>
                <button
                  onClick={() => deletePath(p.id)}
                  title="Delete"
                  aria-label="Delete this learning path"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 8px' }}
                >
                  ×
                </button>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── SETUP: form to start a new analysis ────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div>
        <button onClick={() => setStage('list')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline', marginBottom: '16px' }}>← Back</button>

        <h1 style={{ marginBottom: '4px' }}>🎯 New targeted path</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Upload your CV and paste the job offer. The AI builds a tailored learning programme.
        </p>

        <div className="card" style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Target role
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="Senior React Developer"
            style={{ width: '100%', padding: '12px 14px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        <div className="card" style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Company
          </label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Spotify"
            style={{ width: '100%', padding: '12px 14px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        <div className="card" style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Job offer text <span style={{ textTransform: 'none', color: 'var(--primary)' }}>(paste from LinkedIn / WTTJ)</span>
          </label>
          <textarea
            value={offerText}
            onChange={e => setOfferText(e.target.value)}
            placeholder="Paste the entire job offer here — responsibilities, requirements, tech stack, etc."
            rows={8}
            style={{ width: '100%', padding: '12px 14px', border: '2px solid var(--border-color)', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {offerText.length} characters
          </div>
        </div>

        <div className="card" style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            CV (PDF) <span style={{ textTransform: 'none', color: 'var(--text-muted)', fontWeight: 400 }}>— optional but strongly recommended</span>
          </label>
          <label
            htmlFor="cv-upload"
            style={{
              display: 'block',
              padding: '20px',
              border: '2px dashed var(--border-color)',
              borderRadius: '10px',
              textAlign: 'center',
              cursor: 'pointer',
              background: cvFile ? '#ECFDF5' : '#F8FAFC',
              transition: 'all 0.2s',
            }}
          >
            <input
              id="cv-upload"
              type="file"
              accept="application/pdf"
              onChange={e => handleFileChange(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
            {cvFile ? (
              <div>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>📄</div>
                <div style={{ fontWeight: '700', color: '#065F46' }}>{cvFile.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {(cvFile.size / 1024).toFixed(0)} KB · click to change
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>📎</div>
                <div style={{ fontWeight: '600' }}>Click to upload your CV</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  PDF only, max {MAX_CV_MB} MB
                </div>
              </div>
            )}
          </label>
          {cvError && <div style={{ marginTop: '8px', color: '#EF4444', fontSize: '0.85rem' }}>{cvError}</div>}
        </div>

        <button
          onClick={startAnalysis}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
        >
          🚀 Run personalised analysis
        </button>

        <div style={{ marginTop: '16px', padding: '12px', background: '#EEF2FF', borderRadius: '8px', fontSize: '0.82rem', color: '#3730A3' }}>
          🔒 Your CV is sent to Google Gemini for analysis only. We do not store the raw file on Fluent servers.
        </div>
      </div>
    );
  }

  // ─── ANALYZING: animated progress while waiting for the single API call ────
  if (stage === 'analyzing') {
    return (
      <div style={{ padding: '40px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px', animation: 'pulse 2s infinite' }}>🧠</div>
          <h2 style={{ marginBottom: '6px' }}>Analysing…</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>30 to 60 seconds — the AI is building your path.</p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          {STEP_LABELS.map((label, i) => {
            const done = i < analyzeStep;
            const active = i === analyzeStep;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', opacity: i > analyzeStep ? 0.3 : 1 }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: done ? '#10B981' : active ? '#F59E0B' : 'var(--border-color)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.8rem', flexShrink: 0,
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: active ? '700' : '500', color: 'var(--text-main)' }}>
                  {label}
                  {active && <RefreshCw size={14} style={{ marginLeft: '8px', verticalAlign: 'middle', animation: 'spin 1.5s linear infinite' }} />}
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        `}</style>
      </div>
    );
  }

  // ─── DASHBOARD: full personalised plan view ────────────────────────────────
  if (stage === 'dashboard' && activePath) {
    const learningPlan = activePath.learning_plan || [];
    const gaps = activePath.gap_analysis || [];
    const briefing = activePath.company_briefing || '';
    const cvSummary = activePath.cv_summary || {};
    const interviewQs = activePath.interview_questions || [];
    const coreVocab = activePath.progress?.coreVocabulary || [];
    const visibleVocab = showAllVocab ? coreVocab : coreVocab.slice(0, 10);

    return (
      <div>
        <button onClick={() => { setActivePath(null); setStage('list'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline', marginBottom: '12px' }}>← My paths</button>

        <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '20px', borderRadius: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, marginBottom: '4px' }}>Targeted path</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>{activePath.job_title}</h1>
          <div style={{ fontSize: '0.95rem', opacity: 0.9, marginTop: '2px' }}>{activePath.company_name}</div>
        </div>

        <button
          onClick={() => onLaunchTargetedInterview && onLaunchTargetedInterview(activePath)}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1rem', marginBottom: '20px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
        >
          🎙️ Run targeted interview simulation
        </button>

        {briefing && (
          <div className="card" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>
              <Briefcase size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Company briefing
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6 }}>{briefing}</p>
          </div>
        )}

        {cvSummary?.topSkills?.length > 0 && (
          <div className="card" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700' }}>
              📋 CV summary
            </h2>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
              <strong>{cvSummary.currentRole || '—'}</strong> · {cvSummary.yearsOfExperience || 0} years of experience
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {cvSummary.topSkills.map((s, i) => (
                <span key={i} style={{ background: '#EEF2FF', color: '#3730A3', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{s}</span>
              ))}
            </div>
            {cvSummary.languages?.length > 0 && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Languages:</strong> {cvSummary.languages.join(' · ')}
              </div>
            )}
          </div>
        )}

        {gaps.length > 0 && (
          <div className="card" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
              🧩 CV vs offer gaps
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gaps.map((g, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${severityColor(g.severity)}`, paddingLeft: '12px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{g.gap}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{g.howToBridge}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {coreVocab.length > 0 && (
          <div className="card" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
              <Award size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Core vocabulary ({coreVocab.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: '0.85rem' }}>
              {visibleVocab.map((v, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{v.word}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{v.translation}</div>
                </div>
              ))}
            </div>
            {coreVocab.length > 10 && (
              <button
                onClick={() => setShowAllVocab(s => !s)}
                style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                {showAllVocab ? 'Show less' : `Show ${coreVocab.length - 10} more`}
              </button>
            )}
          </div>
        )}

        {learningPlan.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700' }}>
              <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {learningPlan.length}-day programme
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {learningPlan.map((d) => {
                const isOpen = openDay === d.day;
                return (
                  <div key={d.day} className="card" style={{ padding: '14px', cursor: 'pointer' }} onClick={() => setOpenDay(isOpen ? null : d.day)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '700' }}>Day {d.day}</div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '2px' }}>{d.title}</div>
                      </div>
                      <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
                        {d.vocabulary?.length > 0 && (
                          <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>Vocabulary ({d.vocabulary.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {d.vocabulary.map((v, i) => (
                                <div key={i} style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '6px' }}>
                                  <div><strong>{v.word}</strong> — <span style={{ color: 'var(--text-muted)' }}>{v.translation}</span></div>
                                  <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-main)', marginTop: '2px' }}>{v.example}</div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.exampleTranslation}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {d.grammarFocus && (
                          <div style={{ marginBottom: '14px', padding: '10px 12px', background: '#FFFBEB', borderLeft: '3px solid #F59E0B', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#92400E', fontWeight: '700', marginBottom: '4px' }}>Grammar</div>
                            <div style={{ fontWeight: '700' }}>{d.grammarFocus.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>{d.grammarFocus.explanation}</div>
                            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '4px' }}>{d.grammarFocus.example}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.grammarFocus.exampleTranslation}</div>
                          </div>
                        )}

                        {d.keyExpression && (
                          <div style={{ marginBottom: '14px', padding: '10px 12px', background: '#ECFDF5', borderLeft: '3px solid #10B981', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#065F46', fontWeight: '700', marginBottom: '4px' }}>
                              <Star size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Key expression
                            </div>
                            <div style={{ fontWeight: '700' }}>{d.keyExpression.phrase}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.keyExpression.meaning}</div>
                            <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '4px' }}>{d.keyExpression.example}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.keyExpression.exampleTranslation}</div>
                          </div>
                        )}

                        {d.miniDialogue?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>
                              <MessageCircle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Mini-dialogue
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {d.miniDialogue.map((line, i) => (
                                <div key={i} style={{ padding: '8px 10px', background: line.speaker === 'A' ? '#EEF2FF' : '#F8FAFC', borderRadius: '6px' }}>
                                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)' }}>{line.speaker}</div>
                                  <div style={{ fontSize: '0.88rem' }}>{line.text}</div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{line.translation}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {interviewQs.length > 0 && (
          <div className="card" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
              🎙️ Likely interview questions ({interviewQs.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {interviewQs.map((q, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontWeight: '700' }}>{q.category}</span>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{q.question}</div>
                  {q.whyAsked && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}><em>Why:</em> {q.whyAsked}</div>}
                  {q.hint && <div style={{ fontSize: '0.78rem', color: '#3730A3', marginTop: '2px' }}><em>💡 Hint:</em> {q.hint}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
