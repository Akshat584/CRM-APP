import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Sales' });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setRegisterError('');

    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Min 6 characters required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else {
      setRegisterError(result.error);
    }
  };

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center bg-background p-6">
      <div className="tonal-card w-full max-w-[440px] p-12 shadow-2xl shadow-primary/5 animate-slideIn">
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
          <p className="label-md" style={{ fontSize: '10px' }}>Join the Network</p>
        </header>

        {registerError && (
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
            {registerError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="label-md" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>Professional Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full Name"
              style={{ padding: '12px 0' }}
            />
            {errors.name && (
              <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '8px', fontWeight: '600' }}>{errors.name}</div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label-md" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>Identity</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email Address"
              style={{ padding: '12px 0' }}
            />
            {errors.email && (
              <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '8px', fontWeight: '600' }}>{errors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label className="label-md" style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>Secret</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 characters"
              style={{ padding: '12px 0' }}
            />
            {errors.password && (
              <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '8px', fontWeight: '600' }}>{errors.password}</div>
            )}
          </div>

          <Button type="submit" fullWidth variant="primary" size="lg">
            Create Profile
          </Button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Already associate?{' '}
            <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>
              Access Session
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;