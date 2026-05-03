import { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { LegalFooter } from '../components/LegalDocs.jsx';
import { CookieBanner } from '../components/CookieBanner.jsx';

export function AuthView({ tempLevel, userProfile }) {
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

        {isSignUp && (
          <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
            En créant un compte, vous acceptez nos CGU et notre politique de confidentialité.
          </p>
        )}
      </div>
      <LegalFooter />
      <CookieBanner />
    </div>
  );
}
