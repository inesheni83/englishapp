import { useEffect, useState } from 'react';

export function TestView({ activeDay, appContent, testLevel, onComplete }) {
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
    // Recompute the question pool whenever the day or test level changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
