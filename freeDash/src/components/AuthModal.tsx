import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './AuthModal.module.css';

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      setError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setError(false);

    const { error: signInError } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (signInError) {
      setMessage(signInError.message);
      setError(true);
    } else {
      setMessage('Check your email for the magic link!');
      setError(false);
    }
    setLoading(false);
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
          <div className={styles.subtitle}>Sign in or create an account to start planning.</div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Sending...' : 'Continue with Email'}
          </button>

          {message && (
            <div className={`${styles.msg} ${error ? styles.error : styles.success}`}>
              {message}
            </div>
          )}
        </form>

        <p className={styles.fineprint}>
          We'll send a magic link to your email. No password needed.
        </p>
      </div>
    </>
  );
}
