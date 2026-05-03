import { useState } from 'react';

export function PlacementTestView({ onComplete }) {
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
    if (option === questions[currentIdx].answer) {
      setScore(score + 1);
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
