import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './AuthModal.module.css';
import { useProfile } from '@/hooks/useProfile';

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const { setName, setEmail: setProfileEmail } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      setError(true);
      return;
    }

    if (mode === 'signUp' && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setError(false);

    try {
      if (mode === 'signUp') {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        
        if (signUpError) throw signUpError;

        // Sync local profile
        if (fullName.trim()) setName(fullName);
        setProfileEmail(email);

        // If email confirmation is disabled, session exists instantly
        if (data.session) {
          onClose(); 
        } else {
          setMessage('Account created! Please check your email for a confirmation link.');
          setError(false);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;

        if (data.user?.user_metadata?.full_name) {
          setName(data.user.user_metadata.full_name);
        }
        setProfileEmail(email);
        
        if (data.session) {
          onClose();
        }
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred.');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => m === 'signUp' ? 'signIn' : 'signUp');
    setMessage('');
    setError(false);
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} floatCard`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className={styles.header}>
          <div className={styles.title}>Welcome to atlasio</div>
          <div className={styles.subtitle}>
            {mode === 'signUp' ? 'Create an account to start planning.' : 'Sign back in to your plans.'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signUp' && (
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {mode === 'signUp' && (
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'signUp' ? 'Create Account' : 'Sign In')}
          </button>

          {message && (
            <div className={`${styles.msg} ${error ? styles.error : styles.success}`}>
              {message}
            </div>
          )}
        </form>

        <div className={styles.toggleText}>
          {mode === 'signUp' ? 'Already have an account?' : 'Need an account?'}
          <button type="button" className={styles.toggleBtn} onClick={toggleMode}>
            {mode === 'signUp' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </>
  );
}
