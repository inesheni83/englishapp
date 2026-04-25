import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, BookOpen, User, Play, Mic, Send, BookMarked, BrainCircuit, Mic2, Star, Volume2 } from 'lucide-react';
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
              const maxDay = Math.max(7, ...Object.keys(data.generated_content).map(Number));
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

  const appContent = { ...dailyContent, ...generatedContent };

  if (!session) {
    return <AuthView />;
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
          "grammarRules": [ { "title": "1. Verbe ou Règle", "example": "Exemple d'utilisation", "translation": "Traduction exacte en français de l'exemple" } ]
        }
      }
      Assure-toi que chaque jour a exactement 15 mots dans 'vocab' et 3 ou 4 objets dans 'grammarRules'.`;

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
        {activeTab === 'home' && <HomeView activeDay={activeDay} setActiveDay={handleSetActiveDay} setActiveTab={setActiveTab} totalDays={totalDays} generateNextWeek={generateNextWeek} isGenerating={isGenerating} />}
        {activeTab === 'coach' && <CoachView />}
        {activeTab === 'learn' && <LearnView activeDay={activeDay} appContent={appContent} />}
        {activeTab === 'dialogues' && <DialoguesView />}
        {activeTab === 'expressions' && <ExpressionsView />}
        {activeTab === 'profile' && <ProfileView />}
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
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

function HomeView({ activeDay, setActiveDay, setActiveTab, totalDays, generateNextWeek, isGenerating }) {
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Your {totalDays}-Day Immersion</h1>
      <p style={{ marginBottom: '24px' }}>Complete your daily tasks to achieve fluency.</p>

      <div className="day-selector">
        {daysArray.map((day) => (
          <div 
            key={day} 
            className={`day-bubble ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            <span>Day</span>
            <span>{day}</span>
          </div>
        ))}
        <div 
          className="day-bubble" 
          style={{ background: 'var(--accent-light)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
          onClick={generateNextWeek}
          title="Generate 7 more days with AI"
        >
          {isGenerating ? <div style={{ fontSize: '0.8rem' }}>...</div> : <span style={{ fontSize: '1.2rem' }}>+7</span>}
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

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
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
        "feedback": "L'explication en français de mes erreurs de grammaire ou de vocabulaire. Si c'est parfait ou s'il n'y a pas d'erreur majeure, retourne exactement la chaîne 'Perfect!'.",
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
                {msg.feedback}
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

function LearnView({ activeDay, appContent }) {
  const [showAllVocab, setShowAllVocab] = useState(false);

  const speakExample = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const dayData = appContent[activeDay] || appContent[1];
  const displayedVocab = showAllVocab ? dayData.vocab : dayData.vocab.slice(0, 4);

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Day {activeDay} Material</h1>
      <p style={{ marginBottom: '24px', color: 'var(--primary)', fontWeight: '600' }}>{dayData.title}</p>
      
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Vocabulary for Web Engineers</h2>
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
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Grammar Focus: {dayData.grammarTitle}</h2>
        
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
      </div>
    </div>
  );
}

function ProfileView() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Your Progress</h1>
      
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          JD
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>John Doe</h2>
          <p>Intermediate Level (B1)</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', margin: '24px 0 16px' }}>Statistics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>3</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Day Streak</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>45</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Words Learned</div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>End of Day Test</button>
      
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

function AuthView() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
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
