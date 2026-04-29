import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoginError('');

    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      navigate('/');
    } else {
      setLoginError(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '24px'
    }}>
      <div className="tonal-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '48px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.04)'
      }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: '800',
            fontSize: '24px',
            color: 'var(--accent-primary)',
            letterSpacing: '-0.05em',
            marginBottom: '8px'
          }}>
            Aurelius
          </div>
          <p className="label-md" style={{ fontSize: '10px' }}>Executive CRM Access</p>
        </header>

        {loginError && (
          <div style={{
            padding: '16px',
            background: 'var(--color-error-container)',
            borderRadius: '12px',
            color: 'var(--color-danger)',
            marginBottom: '32px',
            fontSize: '13px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label className="label-md" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>Identity</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              style={{ padding: '12px 0' }}
            />
            {errors.email && (
              <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '8px', fontWeight: '600' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label className="label-md" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>Secret</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{ padding: '12px 0' }}
            />
            {errors.password && (
              <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '8px', fontWeight: '600' }}>
                {errors.password}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth variant="primary" size="lg">
            Initialize Session
          </Button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            New associate?{' '}
            <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>
              Create Account
            </Link>
          </p>
        </div>

        <div className="tonal-card-low" style={{ marginTop: '40px', padding: '16px' }}>
          <span className="label-md" style={{ fontSize: '8px', display: 'block', marginBottom: '8px' }}>Demo Credentials</span>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>Email:</strong> admin@demo.com<br />
            <strong>Pass:</strong> demo1234
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;