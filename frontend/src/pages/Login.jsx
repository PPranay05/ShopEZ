import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Login = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect parameter (e.g. checkout redirection)
  const redirect = new URLSearchParams(location.search).get('redirect') || '';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (userInfo) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [userInfo, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both your email and password.', 'warning');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      showToast('Logged in successfully. Welcome back!', 'success');
    } else {
      showToast(result.message, 'danger');
    }
    setLoading(false);
  };

  return (
    <div className="container auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your orders, cart, and wishlist.</p>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
              <User
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-auth"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link
            to={redirect ? `/register?redirect=${redirect}` : '/register'}
            style={{ color: 'var(--accent-color)', fontWeight: '600' }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
