import { BookMarked, Star, Mic2, Play, BookOpen } from 'lucide-react';

export function HomeView({ activeDay, setActiveDay, setActiveTab, totalDays, generateNextWeek, isGenerating, unlockedDay, challengeStreak, todayChallengeCompleted }) {
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

      {/* === JOB COACH CTA === */}
      <button
        onClick={() => setActiveTab('jobcoach')}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: 0, background: 'none', marginBottom: '16px'
        }}
      >
        <div style={{
          borderRadius: '16px',
          padding: '20px',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #2563EB)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', background: 'rgba(255,255,255,0.18)', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>NEW</div>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginBottom: '4px' }}>Job Coach</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', lineHeight: 1.25 }}>
              Préparez VOTRE prochain entretien
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>
              CV + offre d'emploi → parcours sur-mesure
            </div>
          </div>
          <div style={{ fontSize: '2.5rem' }}>🎯</div>
        </div>
      </button>

      {/* === DAILY CHALLENGE CARD === */}
      <button
        onClick={() => setActiveTab('challenges')}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: 0, background: 'none', marginBottom: '16px'
        }}
      >
        <div style={{
          borderRadius: '16px',
          padding: '20px',
          background: todayChallengeCompleted
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : 'linear-gradient(135deg, #F59E0B, #EF4444)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(245,158,11,0.3)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginBottom: '4px' }}>Daily Challenge</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>
              {todayChallengeCompleted ? '✅ Completed Today!' : '⚡ 2-min Tech Quiz'}
            </div>
            {challengeStreak > 0 && (
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>🔥 {challengeStreak}-day streak</div>
            )}
          </div>
          <div style={{ fontSize: '2.5rem' }}>{todayChallengeCompleted ? '🏆' : '🎯'}</div>
        </div>
      </button>

      <div style={{ marginTop: '8px' }}>
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
