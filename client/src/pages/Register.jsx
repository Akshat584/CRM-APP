import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import Button from '../components/Button';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (inviteToken) {
      const fetchInviteInfo = async () => {
        setLoadingInvite(true);
        try {
          const res = await apiClient.get(`/auth/invite-info/${inviteToken}`);
          setInviteInfo(res.data.data);
          setFormData(prev => ({ ...prev, email: res.data.data.email }));
        } catch (err) {
          setRegisterError('This invitation is invalid or has expired.');
        } finally {
          setLoadingInvite(false);
        }
      };
      fetchInviteInfo();
    }
  }, [inviteToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setRegisterError('');

    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 12) newErrors.password = 'Min 12 characters required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await register({ ...formData, inviteToken });
    if (result.success) {
      navigate('/');
    } else {
      setRegisterError(result.error);
    }
  };

  if (loadingInvite) {
    return <div className="h-screen flex items-center justify-center bg-background text-primary font-bold">Verifying Invitation...</div>;
  }

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
            Aurelius Estate
          </div>
          <p className="label-md" style={{ fontSize: '10px' }}>
            {inviteInfo ? `Joining Team Workspace` : 'Initialize New Organization'}
          </p>
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

        {inviteInfo && !registerError && (
          <div className="bg-primary/5 p-4 rounded-xl mb-8 border border-primary/10 text-center">
             <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Invitation Active</p>
             <p className="text-xs font-bold text-on-surface-variant">You are joining as a <span className="text-primary">{inviteInfo.role}</span></p>
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
              disabled={!!inviteInfo}
              style={{ padding: '12px 0', opacity: inviteInfo ? 0.6 : 1 }}
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
              placeholder="Min 12 characters + Symbols"
              style={{ padding: '12px 0' }}
            />
            {errors.password && (
              <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '8px', fontWeight: '600' }}>{errors.password}</div>
            )}
          </div>

          <Button type="submit" fullWidth variant="primary" size="lg">
            {inviteInfo ? 'Join Workspace' : 'Initialize Organization'}
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