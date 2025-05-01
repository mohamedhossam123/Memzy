import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Memzy - Login</title>
      </Head>
      
      <div className="auth-container">
        <div className="bg-effects">
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">M</div>
              <h1>Memzy</h1>
            </div>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Share your moments with the world</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" legacyBehavior>
                <a className="forgot-password">Forgot password?</a>
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link href="/Auth/SignUp" legacyBehavior>
              <a>Sign up</a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}