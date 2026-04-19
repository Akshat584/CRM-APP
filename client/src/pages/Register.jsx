import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setRegisterError('');

    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      navigate('/');
    } else {
      setRegisterError(result.error);
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
          Create your account
        </p>

        {registerError && (
          <div style={{
            padding: '12px',
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: '8px',
            color: 'var(--color-danger)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {registerError}
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
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              placeholder="John Doe"
            />
            {errors.name && (
              <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                {errors.name}
              </div>
            )}
          </div>

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
              name="email"
              value={formData.email}
              onChange={handleChange}
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

          <div style={{ marginBottom: '20px' }}>
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
              name="password"
              value={formData.password}
              onChange={handleChange}
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {errors.confirmPassword && (
              <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth>
            Create Account
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '14px',
          color: 'var(--text-muted)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;