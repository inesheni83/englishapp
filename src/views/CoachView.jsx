import { useRef, useState } from 'react';
import { Mic, Send, Volume2 } from 'lucide-react';
import { authFetch } from '../lib/authFetch.js';
import { useToast } from '../components/Toast.jsx';

export function CoachView() {
  const toast = useToast();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', response: "Hello! I'm your AI English Coach. Ready for our 3-minute conversation practice today? Let's talk about your current web project and the tech stack you're using.", feedback: null }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingKey, setSpeakingKey] = useState(null);
  const currentAudioRef = useRef(null);

  // Stop any ongoing TTS playback (ElevenLabs Audio + native speechSynthesis).
  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
      } catch { /* noop */ }
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingKey(null);
  };

  const speak = async (text, key = 'auto') => {
    if (!text) return;
    stopSpeaking();
    setSpeakingKey(key);
    try {
      const res = await authFetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => { currentAudioRef.current = null; setSpeakingKey(null); };
        audio.onerror = () => { currentAudioRef.current = null; setSpeakingKey(null); };
        audio.play();
        return; // Success, skip native fallback
      }
    } catch {
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
      utterance.onend = () => setSpeakingKey(null);
      utterance.onerror = () => setSpeakingKey(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeakingKey(null);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    // Don't let the bot's voice overlap with the user's recording
    stopSpeaking();
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

  const speakerBtnStyle = (active) => ({
    background: active ? 'var(--accent-light)' : 'transparent',
    border: 'none',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

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

      const response = await authFetch('/api/gemini', {
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
          // eslint-disable-next-line react-hooks/purity
          const newId = Date.now();
          setMessages(prev => [...prev, { id: newId, type: 'bot', response: parsed.response, feedback: parsed.feedback }]);
          speak(parsed.response, `msg-${newId}`);
        } else {
          throw new Error("Invalid JSON format");
        }
      } else {
        throw new Error("Empty response from AI");
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
            {msg.type === 'bot' ? (
              <div className={`message ${msg.type}`} style={{ margin: 0, maxWidth: '85%', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ flex: 1 }}>{msg.response}</span>
                <button
                  onClick={() => speak(msg.response, `msg-${msg.id}`)}
                  disabled={speakingKey === `msg-${msg.id}`}
                  style={speakerBtnStyle(speakingKey === `msg-${msg.id}`)}
                  title="Replay this message"
                  aria-label="Replay this message"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            ) : (
              <div className={`message ${msg.type}`} style={{ margin: 0, maxWidth: '85%' }}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message bot" style={{ maxWidth: '85%', margin: 0 }}>Thinking...</div>}
      </div>
      <div className="chat-input-area">
        <button
          style={{ background: isRecording ? '#FEE2E2' : 'none', border: 'none', color: isRecording ? '#EF4444' : 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }}
          onClick={startRecording}
          title="Press or click to speak"
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
