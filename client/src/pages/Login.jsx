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
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email format';
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
      background: 'var(--bg-page)'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: '800',
          fontSize: '32px',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          CRM Pro
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Sign in to your account
        </p>

        {loginError && (
          <div style={{
            padding: '12px',
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: '8px',
            color: 'var(--color-danger)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              placeholder="you@example.com"
            />
            {errors.email && (
              <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              placeholder="••••••••"
            />
            {errors.password && (
              <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                {errors.password}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth>
            Sign In
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '14px',
          color: 'var(--text-muted)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: 'var(--bg-surface2)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <strong>Demo Account:</strong><br />
          Email: admin@demo.com<br />
          Password: demo1234
        </div>
      </div>
    </div>
  );
};

export default Login;