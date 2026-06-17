import { useState } from 'react';
import { AuthModal } from './AuthModal';
import styles from './LandingPage.module.css';

interface Props {
  onBypassLogin?: () => void; // Optional: If we still want to allow guest mode
}

export function LandingPage({ onBypassLogin }: Props) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandMark}>
          atlas<span className={styles.brandAccent}>io</span>
        </div>
        <div className={styles.nav}>
          <button className={styles.navLink} onClick={() => setShowAuth(true)}>Log in</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>One stop. Every event.</h1>
          <p className={styles.subtitle}>
            Discover Your best event vendors. Compare real crowdsourced prices, 
            build your perfect plan, and stay within budget—all in one place.
          </p>
          <div className={styles.ctaGroup}>
            <button className={styles.btnPrimary} onClick={() => setShowAuth(true)}>
              Get Started
            </button>
            {onBypassLogin && (
              <button className={styles.btnSecondary} onClick={onBypassLogin}>
                Continue as Guest
              </button>
            )}
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.icon}>🗺️</div>
            <h3>Map-First Discovery</h3>
            <p>Find hidden gems right in your area with our interactive map of verified vendors.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.icon}>⭐</div>
            <h3>Accurate Reviews</h3>
            <p>No more guessing. See average rates and accurate reviews from real couples who booked before you.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.icon}>📋</div>
            <h3>Unified Planning</h3>
            <p>Track your budget, manage your guest list, and sync your plan across all your devices.</p>
          </div>
        </div>
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
