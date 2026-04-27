import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, BookOpen, User, Play, Mic, Send, BookMarked, BrainCircuit, Mic2, Star, Volume2, ChevronDown, Briefcase, ChevronRight, Award, ThumbsUp, RefreshCw } from 'lucide-react';
import './index.css';
import { dailyContent, dialogues, discussionExpressions } from './data.js';
import { supabase } from './supabaseClient';

function App() {
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

  useEffect(() => {
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
      supabase.from('user_progress').select('*').eq('user_id', session.user.id).single()
        .then(({ data, error }) => {
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
      const { data, error } = await supabase.from('user_progress').select('id').eq('user_id', session.user.id).single();
      
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
      console.error("Erreur lors de la sauvegarde :", err);
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

      const response = await fetch('/api/gemini', {
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

      const response = await fetch('/api/gemini', {
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
      console.error("Erreur lors de la génération:", error);
      alert("Une erreur est survenue lors de la génération. Assurez-vous d'utiliser `vercel dev` pour tester les API localement.");
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Day {activeDay}/{totalDays}
          </div>
        </div>
      </header>

      <main className="container">
        {activeTab === 'home' && <HomeView activeDay={activeDay} setActiveDay={handleSetActiveDay} setActiveTab={setActiveTab} totalDays={totalDays} generateNextWeek={generateNextWeek} isGenerating={isGenerating} unlockedDay={unlockedDay} />}
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
        {activeTab === 'interview' && <InterviewView userLevel={userLevel} session={session} />}
      </main>

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

function HomeView({ activeDay, setActiveDay, setActiveTab, totalDays, generateNextWeek, isGenerating, unlockedDay }) {
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Your {totalDays}-Day Immersion</h1>
      <p style={{ marginBottom: '24px' }}>Complete your daily tasks to achieve fluency.</p>

      <div className="day-selector">
        {daysArray.map((day) => {
          const isUnlocked = day <= unlockedDay;
          const isCompleted = day < unlockedDay;
          return (
            <div 
              key={day} 
              className={`day-bubble ${activeDay === day ? 'active' : ''}`}
              onClick={() => isUnlocked && setActiveDay(day)}
              style={{
                opacity: isUnlocked ? 1 : 0.5,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                background: isCompleted ? '#10B981' : (activeDay === day ? 'var(--primary)' : 'white'),
                color: isCompleted ? 'white' : (activeDay === day ? 'white' : 'var(--text-main)'),
                borderColor: isCompleted ? '#10B981' : (activeDay === day ? 'var(--primary)' : 'var(--border-color)')
              }}
            >
              <span>Day</span>
              <span>{day}</span>
              {isCompleted && <span style={{position: 'absolute', top: '-6px', right: '-6px', fontSize: '1rem'}}>✅</span>}
              {!isUnlocked && <span style={{position: 'absolute', top: '-6px', right: '-6px', fontSize: '1rem'}}>🔒</span>}
            </div>
          );
        })}
        <div 
          className="day-bubble" 
          style={{ 
            background: 'var(--accent-light)', 
            borderColor: 'var(--accent)', 
            color: 'var(--accent)',
            opacity: (unlockedDay > totalDays) ? 1 : 0.5,
            cursor: (unlockedDay > totalDays) ? 'pointer' : 'not-allowed'
          }}
          onClick={() => (unlockedDay > totalDays) && generateNextWeek()}
          title={unlockedDay > totalDays ? "Generate 7 more days with AI" : "Complete all current days to unlock more"}
        >
          {isGenerating ? <div style={{ fontSize: '0.8rem' }}>...</div> : <span style={{ fontSize: '1.2rem' }}>+7</span>}
          {!(unlockedDay > totalDays) && <span style={{position: 'absolute', top: '-6px', right: '-6px', fontSize: '1rem'}}>🔒</span>}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Today's Program</h2>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#E0E7FF', borderRadius: '8px', color: 'var(--primary)' }}>
              <BookMarked size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Vocabulary & Expressions</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Learn 20 expressions and 15 words.</p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveTab('learn')}>Start Learning</button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#D1FAE5', borderRadius: '8px', color: 'var(--accent)' }}>
              <Star size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Grammar Rules</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Master 5 essential rules with examples.</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('learn')}>Review Grammar</button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#FEE2E2', borderRadius: '8px', color: 'var(--danger)' }}>
              <Mic2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Conversation Practice</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>3-minute audio recording exercise.</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('coach')}>Start Recording</button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#FEF3C7', borderRadius: '8px', color: '#D97706' }}>
              <Play size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Situational Dialogues</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Listen to 5 workplace conversations.</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('dialogues')}>Show Dialogues</button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#E0F2FE', borderRadius: '8px', color: '#0284C7' }}>
              <BookOpen size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Discussion Expressions</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>30 key phrases for meetings.</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTab('expressions')}>View Expressions</button>
        </div>
      </div>
    </div>
  );
}

function CoachView() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', response: "Hello! I'm your AI English Coach. Ready for our 3-minute conversation practice today? Let's talk about your current web project and the tech stack you're using.", feedback: null }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const speak = async (text) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        return; // Success, skip native fallback
      }
    } catch (e) {
      console.log('ElevenLabs TTS unavailable, using native fallback');
    }

    // Native fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.lang.startsWith('en-US') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) || voices.find(v => v.lang.startsWith('en'));
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

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
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.type === 'bot' ? 'model' : 'user',
        parts: [{ text: m.type === 'bot' ? m.response : m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: userText }] });

      const systemInstruction = `Tu es mon coach d'anglais pour m'aider à atteindre la maîtrise de la langue. Je suis un Ingénieur Web (Web Engineer). 
      Analyse ce que je viens de dire pour corriger ma grammaire et mon vocabulaire.
      Retourne UNIQUEMENT un objet JSON avec ce format exact :
      {
        "feedback": "L'explication en français de mes erreurs, SUIVIE OBLIGATOIREMENT d'une proposition complète corrigeant ma phrase. Tu DOIS encadrer cette proposition complète avec des balises HTML <b> (ex: '<b>Vous auriez dû dire : I am working on it</b>'). Si c'est parfait ou s'il n'y a pas d'erreur majeure, retourne exactement la chaîne 'Perfect!'.",
        "response": "Ta réponse en anglais pour continuer la conversation tech."
      }`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: history,
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setMessages(prev => [...prev, { id: Date.now(), type: 'bot', response: parsed.response, feedback: parsed.feedback }]);
          speak(parsed.response);
        } else {
          throw new Error("Format JSON invalide");
        }
      } else {
        throw new Error("Erreur de réponse");
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', response: "Sorry, I had a connection issue. Can you repeat?", feedback: null }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', margin: '-20px' }}>
      <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', flex: 1, gap: '16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.type === 'bot' && msg.feedback && msg.feedback !== 'Perfect!' && (
              <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '8px 12px', fontSize: '0.85rem', color: '#991B1B', borderRadius: '4px', marginBottom: '8px', maxWidth: '85%' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>👩‍🏫 Coach Feedback:</strong>
                <span dangerouslySetInnerHTML={{ __html: msg.feedback }} />
              </div>
            )}
            {msg.type === 'bot' && msg.feedback === 'Perfect!' && (
              <div style={{ background: '#ECFDF5', borderLeft: '4px solid #10B981', padding: '8px 12px', fontSize: '0.85rem', color: '#065F46', borderRadius: '4px', marginBottom: '8px', maxWidth: '85%' }}>
                <strong style={{ display: 'block' }}>👩‍🏫 Coach Feedback: Perfect grammar! 🌟</strong>
              </div>
            )}
            <div className={`message ${msg.type}`} style={{ margin: 0, maxWidth: '85%' }}>
              {msg.type === 'user' ? msg.text : msg.response}
            </div>
          </div>
        ))}
        {loading && <div className="message bot" style={{ maxWidth: '85%', margin: 0 }}>Thinking...</div>}
      </div>
      <div className="chat-input-area">
        <button 
          style={{ background: isRecording ? '#FEE2E2' : 'none', border: 'none', color: isRecording ? '#EF4444' : 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }}
          onClick={startRecording}
          title="Maintenez ou cliquez pour parler"
        >
          <Mic size={24} />
        </button>
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Type or speak a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={loading}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function LearnView({ activeDay, appContent, setActiveTab, dayTestLevel, setCurrentTestLevel, advancedContent, generateAdvancedContent, isGeneratingAdvanced, userLevel }) {
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
    setVocabDone(false);
    setGrammarDone(false);
    setExpressionsDone(false);
    setDialogueDone(false);
    setSelectedLevel('intermediate');
    setOpenSection({ vocab: false, grammar: false, expressions: false, dialogue: false });
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

function ProfileView({ activeDay, session, setActiveTab, userLevel }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || "User";
  const initials = userEmail.substring(0, 2).toUpperCase();
  const wordsLearned = activeDay * 15;
  const grammarRules = activeDay * 5;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Your Progress</h1>
      
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden', paddingRight: '90px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</h2>
          <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{userLevel}</p>
        </div>
        <button onClick={() => setActiveTab('placement')} style={{ position: 'absolute', right: '16px', top: '16px', padding: '6px 12px', fontSize: '0.8rem', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          Test Level
        </button>
      </div>

      <h2 style={{ fontSize: '1.2rem', margin: '24px 0 16px' }}>Statistics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{activeDay}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Day Streak</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{wordsLearned}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Words Learned</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>{grammarRules}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Grammar Rules</div>
        </div>
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#F59E0B' }}>Level Up</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{Math.max(0, 7 - activeDay)} days left</div>
        </div>
      </div>
      
      <button 
        onClick={handleLogout}
        className="btn btn-outline" 
        style={{ width: '100%', marginTop: '16px', borderColor: 'var(--danger-color, #ef4444)', color: 'var(--danger-color, #ef4444)' }}
      >
        Se déconnecter
      </button>
    </div>
  );
}

function TestView({ activeDay, appContent, testLevel, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [finished, setFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const playSound = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.1); // C#6
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio error', e);
    }
  };

  useEffect(() => {
    const dayData = appContent[activeDay];
    if (!dayData || !dayData.vocab) return;
    const vocab = dayData.vocab;

    let generatedQs;
    if (testLevel === 'advanced') {
      // Advanced: Mix of grammar fill-in + word-in-context questions
      const grammarQs = (dayData.grammarRules || []).slice(0, 4).map(rule => {
        const sentence = rule.example.replace(/["]/g, '');
        const blank = sentence.replace(rule.title.split('.')[1]?.trim().split(' ')[0] || 'the', '___');
        const wrongWords = vocab.slice(0, 3).map(v => v.word);
        const opts = [...new Set([...wrongWords, sentence])].slice(0, 4).sort(() => 0.5 - Math.random());
        return { question: `Complete: ${blank}`, options: opts, answer: sentence };
      });
      const shuffled = [...vocab].sort(() => 0.5 - Math.random()).slice(0, 6);
      const vocabContextQs = shuffled.map(wordObj => {
        const others = vocab.filter(v => v.word !== wordObj.word);
        const wrong = [...others].sort(() => 0.5 - Math.random()).slice(0, 3).map(v => v.translation);
        const opts = [...wrong, wordObj.translation].sort(() => 0.5 - Math.random());
        return {
          question: `Context: "${wordObj.example || wordObj.word}" — what does "${wordObj.word}" mean?`,
          options: opts,
          answer: wordObj.translation
        };
      });
      generatedQs = [...grammarQs, ...vocabContextQs].sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
      // Intermediate: Translation → English word (original)
      const shuffled = [...vocab].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
      generatedQs = selected.map(wordObj => {
        const others = vocab.filter(v => v.word !== wordObj.word);
        const wrongOptions = [...others].sort(() => 0.5 - Math.random()).slice(0, 3).map(v => v.word);
        const options = [...wrongOptions, wordObj.word].sort(() => 0.5 - Math.random());
        return { question: `Select the English word for: "${wordObj.translation}"`, options, answer: wordObj.word };
      });
    }
    setQuestions(generatedQs.filter(q => q.options.length === 4));
  }, [activeDay, appContent, testLevel]);

  const handleOptionClick = (option) => {
    if (option === questions[currentIdx].answer) {
      playSound('success');
      setScore(score + 1);
    } else {
      playSound('error');
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
        return;
      }
    }
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
    }
  };

  if (gameOver) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '16px' }}>💔</h1>
        <h2>Game Over!</h2>
        <p style={{ margin: '16px 0', fontSize: '1.2rem' }}>You made 3 mistakes. Try again later!</p>
        <button className="btn btn-primary" onClick={() => onComplete(false)} style={{ width: '100%', marginTop: '24px' }}>Back to Profile</button>
      </div>
    );
  }

  if (finished) {
    const success = score >= 8;
    const isAdvanced = testLevel === 'advanced';
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '16px' }}>{success ? (isAdvanced ? '🏆' : '🎯') : '👏'}</h1>
        <h2>{success ? (isAdvanced ? 'Advanced Passed! Next day unlocked! 🔓' : 'Intermediate Passed!') : 'Not quite! (Need 8/10)'}</h2>
        {success && isAdvanced && <p style={{ margin: '8px 0', color: '#10B981', fontWeight: '600' }}>You can now access the next day!</p>}
        {success && !isAdvanced && <p style={{ margin: '8px 0', color: '#F59E0B', fontWeight: '600' }}>Now take the Advanced Test to unlock the next day.</p>}
        <p style={{ margin: '16px 0', fontSize: '1.2rem' }}>Your score: <strong style={{ color: 'var(--primary)' }}>{score} / {questions.length}</strong></p>
        <button className="btn btn-primary" onClick={() => onComplete(success)} style={{ width: '100%', marginTop: '24px' }}>Continue</button>
      </div>
    );
  }

  if (questions.length === 0) return <div>Loading quiz...</div>;

  const q = questions[currentIdx];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Day {activeDay} — {testLevel === 'advanced' ? '🔴 Advanced' : '🟡 Intermediate'}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{testLevel === 'advanced' ? 'Pass to unlock next day' : 'Pass to unlock Advanced'}</div>
        </div>
        <div style={{ fontSize: '1.2rem', color: '#EF4444', fontWeight: 'bold' }}>
          {'❤️ '.repeat(lives)}{'🤍 '.repeat(3 - lives)}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Question {currentIdx + 1} of {questions.length}</p>
      
      <div className="card" style={{ marginBottom: '24px', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1.4rem', margin: '0', color: '#1E293B' }}>{q.question}</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {q.options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleOptionClick(opt)}
            style={{ 
              padding: '16px', 
              background: 'white', 
              border: '2px solid var(--border-color)', 
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              fontWeight: '500',
              color: 'var(--text-main)'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlacementTestView({ onComplete }) {
  const questions = [
    { question: "I ___ working on a new React project right now.", options: ["am", "is", "are", "be"], answer: "am" },
    { question: "Yesterday, we ___ a bug in the production database.", options: ["find", "founded", "found", "finds"], answer: "found" },
    { question: "If I ___ more time, I would refactor this legacy code.", options: ["have", "had", "would have", "having"], answer: "had" },
    { question: "The API endpoint is currently down, ___?", options: ["isn't it", "is it", "doesn't it", "does it"], answer: "isn't it" },
    { question: "By the time the client reviews the app, we ___ all the features.", options: ["will finish", "finished", "will have finished", "have finished"], answer: "will have finished" },
    { question: "He is used to ___ late when a deadline is approaching.", options: ["work", "working", "worked", "be working"], answer: "working" },
    { question: "___ had the server crashed than the monitoring system sent an alert.", options: ["No sooner", "Hardly", "As soon as", "Immediately"], answer: "No sooner" },
    { question: "The senior developer suggested that the junior ___ the documentation first.", options: ["read", "reads", "will read", "reading"], answer: "read" },
    { question: "Despite ___ a difficult sprint, the team delivered the features on time.", options: ["they had", "having", "of having", "had"], answer: "having" },
    { question: "This framework is incredibly robust; ___, it lacks comprehensive documentation.", options: ["furthermore", "however", "therefore", "consequently"], answer: "however" }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleOptionClick = (option) => {
    let newScore = score;
    if (option === questions[currentIdx].answer) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    let level = "Beginner (A1)";
    if (score >= 3) level = "Elementary (A2)";
    if (score >= 5) level = "Intermediate (B1)";
    if (score >= 7) level = "Upper Intermediate (B2)";
    if (score >= 9) level = "Advanced (C1)";
    if (score === 10) level = "Proficient (C2)";

    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</h1>
        <h2>Evaluation Complete!</h2>
        <p style={{ margin: '16px 0', fontSize: '1.2rem' }}>Your evaluated level is:</p>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '32px' }}>{level}</div>
        <button className="btn btn-primary" onClick={() => onComplete(level)} style={{ width: '100%' }}>Save and Continue</button>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>Placement Test</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Question {currentIdx + 1} of {questions.length}</p>
      
      <div className="card" style={{ marginBottom: '24px', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '1.4rem', margin: '0', color: '#1E293B' }}>{q.question}</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {q.options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleOptionClick(opt)}
            style={{ 
              padding: '16px', 
              background: 'white', 
              border: '2px solid var(--border-color)', 
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              fontWeight: '500',
              color: 'var(--text-main)'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function DialoguesView() {
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

function ExpressionsView() {
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

function AuthView({ tempLevel, userProfile }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(tempLevel ? true : false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.user?.id) {
          const initialContent = {};
          if (tempLevel) initialContent.userLevel = tempLevel;
          if (userProfile && Object.keys(userProfile).length > 0) initialContent.userProfile = userProfile;
          await supabase.from('user_progress').insert({ 
            user_id: data.user.id, 
            active_day: 1,
            generated_content: Object.keys(initialContent).length > 0 ? initialContent : { userLevel: 'Not evaluated' }
          });
        }
        
        alert('Inscription réussie ! Vérifiez vos emails pour confirmer votre compte (si activé par défaut sur Supabase), ou connectez-vous.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '8px', fontSize: '2.5rem', fontWeight: 'bold' }}>Fluent</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>AI English Coach for Web Engineers</p>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '500' }}>Adresse Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', boxSizing: 'border-box' }} 
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '500' }}>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', boxSizing: 'border-box' }} 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px', padding: '14px', fontSize: '1rem', width: '100%' }}>
            {loading ? 'Chargement...' : (isSignUp ? "Créer un compte" : "Se connecter")}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {isSignUp ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', marginLeft: '8px', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            {isSignUp ? "Se connecter" : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

// ============================================================
// ONBOARDING QUIZ VIEW
// ============================================================
function OnboardingQuizView({ onComplete }) {
  const steps = [
    {
      id: 'goal',
      title: "What's your main goal?",
      subtitle: "We'll personalize your path based on this",
      emoji: '🎯',
      options: [
        { value: 'interview', label: 'Ace job interviews', icon: '🎙️' },
        { value: 'meetings', label: 'Speak in meetings', icon: '🗣️' },
        { value: 'emails', label: 'Write pro emails', icon: '📧' },
        { value: 'presentations', label: 'Give presentations', icon: '📊' },
      ]
    },
    {
      id: 'sector',
      title: "What's your role?",
      subtitle: "Your vocabulary will be tailored to your field",
      emoji: '🧑‍💻',
      options: [
        { value: 'frontend', label: 'Frontend Developer', icon: '⚛️' },
        { value: 'backend', label: 'Backend Developer', icon: '⚙️' },
        { value: 'devops', label: 'DevOps / Cloud', icon: '☁️' },
        { value: 'data', label: 'Data / ML Engineer', icon: '📊' },
        { value: 'pm', label: 'Product Manager', icon: '🗂️' },
        { value: 'fullstack', label: 'Full-Stack', icon: '🔀' },
      ]
    },
    {
      id: 'time',
      title: "How much time per day?",
      subtitle: "We'll create bite-sized sessions that fit your schedule",
      emoji: '⏱️',
      options: [
        { value: '5', label: '5 minutes', icon: '⚡', desc: 'Quick daily habit' },
        { value: '15', label: '15 minutes', icon: '🎯', desc: 'Recommended' },
        { value: '30', label: '30 minutes', icon: '🚀', desc: 'Accelerated progress' },
      ]
    },
    {
      id: 'deadline',
      title: "When's your next challenge?",
      subtitle: "We'll prioritize what's most useful for your timing",
      emoji: '📅',
      options: [
        { value: '1month', label: 'Within 1 month', icon: '🔥', desc: 'Intensive plan' },
        { value: '3months', label: 'Within 3 months', icon: '📈', desc: 'Balanced plan' },
        { value: 'nodate', label: 'No specific date', icon: '🌱', desc: 'Long-term growth' },
      ]
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [animating, setAnimating] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep) / steps.length) * 100;

  const handleSelect = (value) => {
    const newSelections = { ...selections, [step.id]: value };
    setSelections(newSelections);
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(newSelections);
      }
    }, 250);
  };

  return (
    <div style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.25s ease' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Step {currentStep + 1} of {steps.length}
        </div>
        {/* Progress bar */}
        <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', marginBottom: '28px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #4F46E5, #7C3AED)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{step.emoji}</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>{step.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{step.subtitle}</p>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: step.options.length <= 3 ? '1fr' : '1fr 1fr', gap: '10px' }}>
        {step.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid var(--border-color)',
              background: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.background = '#EEF2FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'white'; }}
          >
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{opt.icon}</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{opt.label}</div>
              {opt.desc && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// INTERVIEW SIMULATION VIEW
// ============================================================
function InterviewView({ userLevel, session }) {
  const [stage, setStage] = useState('setup'); // setup | generating | interview | evaluating | feedback
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

  const levelBand = (() => {
    const base = userLevel?.split(' ')?.[0] || 'B1';
    const map = { A1: 'A1/A2', A2: 'A1/A2', B1: 'B1/B2', B2: 'B1/B2', C1: 'C1/C2', C2: 'C1/C2' };
    return map[base] || 'B1/B2';
  })();

  const fetchHistory = async () => {
    if (!session?.user) return;
    setStage('history');
    setIsFetchingHistory(true);
    try {
      const { data, error } = await supabase
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
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a pure JSON generator. Return only valid JSON, no markdown.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.status === 429) {
        throw new Error('RATE_LIMIT');
      }

      if (!res.ok) {
        throw new Error(`API_ERROR_${res.status}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    } catch (err) {
      throw err;
    }
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
  };

  const meta = window._interviewMeta || {};
  const scoreColor = (s) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

  // ─── SETUP ───────────────────────────────────────────────────────────────────
  if (stage === 'setup') return (
    <div>
      <h1 style={{ marginBottom: '4px' }}>🎙️ Interview Simulator</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.9rem' }}>
        Practise a real job interview with AI. Get personalised feedback on your English and your answers.
      </p>

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
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', background: '#EEF2FF', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {q.category}
          </span>
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
