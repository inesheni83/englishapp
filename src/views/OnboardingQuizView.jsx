import { useState } from 'react';

export function OnboardingQuizView({ onComplete }) {
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
