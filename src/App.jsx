import { useEffect, useState } from 'react';
import { Home, MessageCircle, BookOpen, User, Briefcase } from 'lucide-react';
import './index.css';
import { dailyContent } from './data.js';
import { supabase } from './supabaseClient';
import { authFetch } from './lib/authFetch.js';
import { describeApiError } from './lib/apiErrors.js';
import { useToast } from './components/Toast.jsx';

import { LegalFooter, LegalDocInline } from './components/LegalDocs.jsx';
import { CookieBanner } from './components/CookieBanner.jsx';
import { JobCoachView } from './components/JobCoachView.jsx';

import { HomeView } from './views/HomeView.jsx';
import { CoachView } from './views/CoachView.jsx';
import { LearnView } from './views/LearnView.jsx';
import { ProfileView } from './views/ProfileView.jsx';
import { TestView } from './views/TestView.jsx';
import { PlacementTestView } from './views/PlacementTestView.jsx';
import { DialoguesView } from './views/DialoguesView.jsx';
import { ExpressionsView } from './views/ExpressionsView.jsx';
import { AuthView } from './views/AuthView.jsx';
import { OnboardingQuizView } from './views/OnboardingQuizView.jsx';
import { InterviewView } from './views/InterviewView.jsx';
import { ChallengesView } from './views/ChallengesView.jsx';

function App() {
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [activeDay, setActiveDay] = useState(1);
  const [totalDays, setTotalDays] = useState(7);
  const [generatedContent, setGeneratedContent] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [userLevel, setUserLevel] = useState("Not evaluated");
  const [onboardingStep, setOnboardingStep] = useState('welcome');
  const [tempLevel, setTempLevel] = useState(null);
  const [unlockedDay, setUnlockedDay] = useState(1);
  const [dayTestLevel, setDayTestLevel] = useState({});
  const [currentTestLevel, setCurrentTestLevel] = useState('intermediate');
  const [advancedContent, setAdvancedContent] = useState({});
  const [isGeneratingAdvanced, setIsGeneratingAdvanced] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [challengeStreak, setChallengeStreak] = useState(0);
  const [todayChallengeCompleted, setTodayChallengeCompleted] = useState(false);
  const [targetedJobPath, setTargetedJobPath] = useState(null);

  useEffect(() => {
    // Sync external auth state (Supabase) -> internal session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Hydrate state from Supabase user_progress on session change
      supabase.from('user_progress').select('*').eq('user_id', session.user.id).single()
        .then(({ data }) => {
          if (data) {
            if (data.active_day) setActiveDay(data.active_day);
            if (data.generated_content) {
              setGeneratedContent(data.generated_content);
              if (data.generated_content.userLevel) {
                setUserLevel(data.generated_content.userLevel);
              }
              if (data.generated_content.unlockedDay) {
                setUnlockedDay(data.generated_content.unlockedDay);
              } else {
                setUnlockedDay(data.active_day || 1);
              }
              if (data.generated_content.dayTestLevel) {
                setDayTestLevel(data.generated_content.dayTestLevel);
              }
              if (data.generated_content.advancedContent) {
                setAdvancedContent(data.generated_content.advancedContent);
              }
              // Load challenge streak
              const challenges = data.generated_content.challenges || {};
              const today = new Date().toISOString().split('T')[0];
              setTodayChallengeCompleted(!!challenges[today]);
              // Calculate streak
              let streak = 0;
              let checkDate = today;
              while (challenges[checkDate]) {
                streak++;
                checkDate = new Date(new Date(checkDate) - 86400000).toISOString().split('T')[0];
              }
              setChallengeStreak(streak);
              const validKeys = Object.keys(data.generated_content).map(Number).filter(n => !isNaN(n));
              const maxDay = validKeys.length > 0 ? Math.max(7, ...validKeys) : 7;
              setTotalDays(maxDay);
            }
          }
        });
    }
  }, [session]);

  const updateProgress = async (newActiveDay, newGeneratedContent) => {
    if (!session?.user) return;
    try {
      const { data } = await supabase.from('user_progress').select('id').eq('user_id', session.user.id).single();

      if (data) {
        await supabase.from('user_progress').update({
          active_day: newActiveDay,
          generated_content: newGeneratedContent,
          updated_at: new Date()
        }).eq('user_id', session.user.id);
      } else {
        await supabase.from('user_progress').insert({
          user_id: session.user.id,
          active_day: newActiveDay,
          generated_content: newGeneratedContent
        });
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  const handleSetActiveDay = (day) => {
    setActiveDay(day);
    updateProgress(day, generatedContent);
  };

  const handleUpdateLevel = (newLevel) => {
    setUserLevel(newLevel);
    const updatedContent = { ...generatedContent, userLevel: newLevel };
    setGeneratedContent(updatedContent);
    updateProgress(activeDay, updatedContent);
    setActiveTab('profile');
  };

  const generateAdvancedContent = async (day, dayTitle, intermediateData) => {
    if (advancedContent[day] || isGeneratingAdvanced) return;
    setIsGeneratingAdvanced(true);

    // Determine target level band
    const levelMap = {
      'A1': 'A1/A2', 'A2': 'A1/A2',
      'B1': 'B1/B2', 'B2': 'B1/B2',
      'C1': 'C1/C2', 'C2': 'C1/C2'
    };
    const baseLevel = userLevel?.split(' ')?.[0] || 'B1';
    const levelBand = levelMap[baseLevel] || 'B1/B2';

    // Summarize intermediate vocab to avoid repetition
    const intermediateWords = (intermediateData?.vocab || []).map(v => v.word).join(', ');
    const intermediateGrammar = intermediateData?.grammarTitle || '';

    try {
      const prompt = `You are an expert bilingual English teacher. Generate ADVANCED English content for a francophone Web Engineer at CEFR level ${levelBand}, Day ${day}: "${dayTitle}".

      LANGUAGE RULE (MANDATORY):
      - ALL content (words, examples, sentences, dialogue, expressions) MUST be written in ENGLISH.
      - French is used ONLY for the "translation" / "exampleTranslation" / "meaning" fields.
      - NEVER write French in the "word", "example", "text", "phrase", "grammarDesc", "grammarSyntax" fields.

      CONTEXT (Intermediate content already covered — DO NOT repeat):
      - Vocabulary already studied: ${intermediateWords}
      - Grammar already studied: ${intermediateGrammar}

      YOUR TASK: Create harder content within the SAME ${levelBand} level band — do NOT exceed this level.
      - Same topic (${dayTitle}) but DEEPER — more nuanced, less common, more professional
      - Vocabulary: more advanced synonyms, collocations, idioms NOT in the intermediate list
      - Grammar: a MORE COMPLEX rule within ${levelBand} (e.g., advanced passive, discourse markers, inversion, mixed conditionals)
      - Expressions: more idiomatic, professional register — each must be a COMPLETE English sentence in the "example" field
      - Dialogue: natural, complex — a real workplace scenario in English with 8 lines

      Return ONLY this valid JSON (no markdown, no explanation):
      {
        "vocab": [
          {
            "word": "ENGLISH word or idiom",
            "translation": "traduction française",
            "category": "category in English",
            "example": "A complete English sentence using this word.",
            "exampleTranslation": "Traduction française de cette phrase."
          }
        ],
        "grammarTitle": "Advanced Grammar Rule Title in English",
        "grammarDesc": "English explanation of when and why to use this grammar rule.",
        "grammarSyntax": "English syntax structure (e.g., Subject + had + past participle)",
        "grammarRules": [
          {
            "title": "1. Rule name in English",
            "example": "A complete English sentence illustrating this rule.",
            "translation": "Traduction française de cette phrase."
          }
        ],
        "expressions": [
          {
            "phrase": "The English expression",
            "meaning": "Explication courte en français",
            "example": "A complete English sentence using this expression naturally.",
            "translation": "Traduction française de la phrase d'exemple."
          }
        ],
        "dialogue": [
          {
            "speaker": "A",
            "text": "The English sentence spoken by speaker A.",
            "translation": "Traduction française."
          }
        ]
      }
      Constraints: exactly 15 vocab words, exactly 4 grammarRules, exactly 10 expressions, exactly 8 dialogue lines.`;

      const response = await authFetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a pure JSON generator. Return only valid JSON, no extra text.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const newAdvanced = { ...advancedContent, [day]: parsed };
          setAdvancedContent(newAdvanced);
          const updatedContent = { ...generatedContent, advancedContent: newAdvanced };
          setGeneratedContent(updatedContent);
          updateProgress(activeDay, updatedContent);
        }
      }
    } catch (e) {
      console.error('Advanced content generation failed:', e);
    }
    setIsGeneratingAdvanced(false);
  };

  const appContent = { ...dailyContent, ...generatedContent };

  if (!session) {
    if (onboardingStep === 'welcome') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '420px', width: '100%' }}>
            {/* Logo */}
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>F</div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Welcome to Fluent</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '40px', fontSize: '1.1rem' }}>Your AI English Coach for Tech Professionals</p>

            {/* Value propositions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
              {[
                { icon: '🎯', title: 'Personalized', desc: 'Adapted to your CEFR level' },
                { icon: '🧑‍💻', title: 'Tech-Focused', desc: 'React, Docker, APIs vocabulary' },
                { icon: '🎙️', title: 'Interview Sim', desc: 'Practice with real questions' },
                { icon: '🤖', title: 'AI-Powered', desc: 'Gemini generates your content' }
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>{item.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem', padding: '18px', background: 'white', color: '#4F46E5', fontWeight: '800', borderRadius: '14px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', cursor: 'pointer', marginBottom: '12px' }}
              onClick={() => setOnboardingStep('quiz')}
            >
              🚀 Get Started — Free
            </button>
            <button
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              onClick={() => setOnboardingStep('auth')}
            >
              I already have an account
            </button>

            <div style={{ marginTop: '32px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              <button onClick={() => setOnboardingStep('legal-notice')} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', padding: '4px' }}>Legal notice</button>
              <span style={{ margin: '0 6px' }}>·</span>
              <button onClick={() => setOnboardingStep('legal-privacy')} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', padding: '4px' }}>Privacy</button>
              <span style={{ margin: '0 6px' }}>·</span>
              <button onClick={() => setOnboardingStep('legal-terms')} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', padding: '4px' }}>Terms</button>
            </div>
          </div>
          <CookieBanner />
        </div>
      );
    }

    if (onboardingStep === 'legal-notice' || onboardingStep === 'legal-privacy' || onboardingStep === 'legal-terms') {
      const docKey = onboardingStep === 'legal-notice' ? 'legal' : onboardingStep === 'legal-privacy' ? 'privacy' : 'terms';
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '20px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <button onClick={() => setOnboardingStep('welcome')} style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.95rem', textDecoration: 'underline' }}>← Back</button>
            <LegalDocInline docKey={docKey} />
          </div>
        </div>
      );
    }

    if (onboardingStep === 'quiz') {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '480px', width: '100%' }}>
            <OnboardingQuizView onComplete={(profile) => {
              setUserProfile(profile);
              setOnboardingStep('placement');
            }} />
          </div>
        </div>
      );
    }

    if (onboardingStep === 'placement') {
      return (
        <div className="app-container" style={{ background: 'white' }}>
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
            <PlacementTestView onComplete={(level) => {
              setTempLevel(level);
              setOnboardingStep('auth');
            }} />
          </div>
        </div>
      );
    }

    return <AuthView tempLevel={tempLevel} userProfile={userProfile} />;
  }

  const generateNextWeek = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Génère 7 jours supplémentaires de programme d'immersion en anglais pour un ingénieur web.
      Les jours seront numérotés de ${totalDays + 1} à ${totalDays + 7}.
      Retourne UNIQUEMENT un objet JSON valide au format exact suivant:
      {
        "${totalDays + 1}": {
          "title": "Titre du jour",
          "vocab": [ { "word": "mot anglais", "translation": "traduction", "category": "catégorie", "example": "phrase d'exemple en anglais", "exampleTranslation": "traduction de l'exemple en français" } ],
          "grammarTitle": "Titre grammaire",
          "grammarDesc": "Description détaillée",
          "grammarSyntax": "Syntaxe",
          "grammarRules": [ { "title": "1. Verbe ou Règle", "example": "Exemple d'utilisation", "translation": "Traduction exacte en français de l'exemple" } ],
          "expressions": [ { "phrase": "expression en anglais", "meaning": "sens", "context": "contexte en français" } ],
          "dialogue": [ { "speaker": "A", "text": "texte anglais", "translation": "traduction" } ]
        }
      }
      Assure-toi que chaque jour a exactement 15 mots dans 'vocab', 3 ou 4 objets dans 'grammarRules', 10 objets dans 'expressions', et un 'dialogue' de 6 à 8 répliques.`;

      const response = await authFetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Tu es un générateur de données JSON pur." }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const newContent = JSON.parse(jsonMatch[0]);
          const updatedContent = { ...generatedContent, ...newContent };
          setGeneratedContent(updatedContent);
          setTotalDays(totalDays + 7);
          updateProgress(activeDay, updatedContent);
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error(describeApiError(error));
    }
    setIsGenerating(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-icon">F</div>
          <div>
            <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)' }}>Fluent</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tech English Coach</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {challengeStreak > 0 && (
            <button
              onClick={() => setActiveTab('challenges')}
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '16px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🔥 {challengeStreak}
            </button>
          )}
          <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Day {activeDay}/{totalDays}
          </div>
        </div>
      </header>

      <main className="container">
        {activeTab === 'home' && <HomeView activeDay={activeDay} setActiveDay={handleSetActiveDay} setActiveTab={setActiveTab} totalDays={totalDays} generateNextWeek={generateNextWeek} isGenerating={isGenerating} unlockedDay={unlockedDay} challengeStreak={challengeStreak} todayChallengeCompleted={todayChallengeCompleted} />}
        {activeTab === 'coach' && <CoachView />}
        {activeTab === 'learn' && <LearnView
          activeDay={activeDay}
          appContent={appContent}
          setActiveTab={setActiveTab}
          dayTestLevel={dayTestLevel}
          setCurrentTestLevel={setCurrentTestLevel}
          advancedContent={advancedContent}
          generateAdvancedContent={generateAdvancedContent}
          isGeneratingAdvanced={isGeneratingAdvanced}
          userLevel={userLevel}
        />}
        {activeTab === 'dialogues' && <DialoguesView />}
        {activeTab === 'expressions' && <ExpressionsView />}
        {activeTab === 'profile' && <ProfileView activeDay={activeDay} session={session} setActiveTab={setActiveTab} userLevel={userLevel} />}
        {activeTab === 'test' && <TestView activeDay={activeDay} appContent={appContent} testLevel={currentTestLevel} onComplete={(success) => {
          if (success) {
            if (currentTestLevel === 'advanced' && activeDay === unlockedDay) {
              // Advanced passed → unlock next day
              const nextDay = activeDay + 1;
              const newDayTestLevel = { ...dayTestLevel, [activeDay]: 'advanced' };
              setDayTestLevel(newDayTestLevel);
              setUnlockedDay(nextDay);
              const updatedContent = { ...generatedContent, unlockedDay: nextDay, dayTestLevel: newDayTestLevel };
              setGeneratedContent(updatedContent);
              updateProgress(nextDay, updatedContent);
              setActiveDay(nextDay);
            } else if (currentTestLevel === 'intermediate') {
              // Intermediate passed → mark it, but don't unlock next day
              const newDayTestLevel = { ...dayTestLevel, [activeDay]: 'intermediate' };
              setDayTestLevel(newDayTestLevel);
              const updatedContent = { ...generatedContent, dayTestLevel: newDayTestLevel };
              setGeneratedContent(updatedContent);
              updateProgress(activeDay, updatedContent);
            }
          }
          setActiveTab('learn');
        }} />}
        {activeTab === 'placement' && <PlacementTestView onComplete={handleUpdateLevel} />}
        {activeTab === 'interview' && <InterviewView
          userLevel={userLevel}
          session={session}
          targetedPath={targetedJobPath}
          onTargetedConsumed={() => setTargetedJobPath(null)}
          onSwitchToJobCoach={() => setActiveTab('jobcoach')}
        />}
        {activeTab === 'jobcoach' && <JobCoachView
          session={session}
          userLevel={userLevel}
          onLaunchTargetedInterview={(path) => {
            setTargetedJobPath(path);
            setActiveTab('interview');
          }}
        />}
        {activeTab === 'challenges' && <ChallengesView
          userLevel={userLevel}
          session={session}
          generatedContent={generatedContent}
          setGeneratedContent={setGeneratedContent}
          updateProgress={updateProgress}
          activeDay={activeDay}
          challengeStreak={challengeStreak}
          setChallengeStreak={setChallengeStreak}
          todayChallengeCompleted={todayChallengeCompleted}
          setTodayChallengeCompleted={setTodayChallengeCompleted}
        />}
        <LegalFooter />
      </main>

      <CookieBanner />

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className={`nav-item ${activeTab === 'learn' ? 'active' : ''}`} onClick={() => setActiveTab('learn')}>
          <BookOpen size={24} />
          <span>Learn</span>
        </button>
        <button className={`nav-item ${activeTab === 'coach' ? 'active' : ''}`} onClick={() => setActiveTab('coach')}>
          <MessageCircle size={24} />
          <span>AI Coach</span>
        </button>
        <button className={`nav-item ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>
          <Briefcase size={24} />
          <span>Interview</span>
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
