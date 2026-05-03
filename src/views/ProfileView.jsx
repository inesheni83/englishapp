import { supabase } from '../supabaseClient.js';

export function ProfileView({ activeDay, session, setActiveTab, userLevel }) {
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
