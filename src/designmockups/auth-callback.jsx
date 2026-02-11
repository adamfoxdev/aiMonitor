import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash (Supabase OAuth callback)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/login?error=oauth_failed');
          return;
        }

        if (session) {
          // User is authenticated via OAuth
          const { user } = session;

          // Store the access token
          localStorage.setItem('authToken', session.access_token);

          // Create or update user profile in our database
          try {
            // Call backend to handle user creation/profile setup
            const response = await fetch('http://localhost:3001/api/auth/oauth-callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email.split('@')[0],
              }),
            });

            if (!response.ok) {
              console.error('Failed to create user profile');
            }
          } catch (err) {
            console.error('Profile creation error:', err);
            // Don't block auth if profile creation fails
          }

          // Redirect to onboarding
          navigate('/onboarding');
        } else {
          navigate('/login?error=no_session');
        }
      } catch (err) {
        console.error('Callback handler error:', err);
        navigate('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050506',
      color: '#FAFAFA',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 50,
          height: 50,
          margin: '0 auto 20px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTop: '3px solid #6366F1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p>Completing sign in...</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
