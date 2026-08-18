import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset' | 'activate'>('login');
  const [lifecyclePassword, setLifecyclePassword] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset');
    const activate = params.get('activate');
    if (reset) { setToken(reset); setMode('reset'); }
    if (activate) { setToken(activate); setMode('activate'); }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err?.message ?? 'Invalid customer credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLifecycleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const base = (import.meta as any).env?.VITE_API_BASE ?? '';
      const endpoint = mode === 'forgot'
        ? '/api/portal/password-reset/request'
        : mode === 'reset'
          ? '/api/portal/password-reset/confirm'
          : '/api/portal/activate';
      const body = mode === 'forgot'
        ? { identifier: username.trim() }
        : { token, password: lifecyclePassword };
      const response = await fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to complete this request.');
      setSuccess(result.message || (mode === 'forgot' ? 'Check your email for a secure link.' : 'Done.'));
      if (mode !== 'forgot') setTimeout(() => setMode('login'), 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to complete this request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', background: '#0D1F3C', overflow: 'hidden' }}>
      
      {/* ── LEFT HERO BRAND PANEL (DESKTOP) ── */}
      <div 
        className="hidden lg:flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          position: 'relative',
          background: 'linear-gradient(135deg, #0D1F3C 0%, #162B4D 100%)',
        }}
      >
        {/* Background glow accents */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,51,41,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%', width: 450, height: 450,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,184,0,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'linear-gradient(135deg, #E63329 0%, #C42A21 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 24, color: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(230,51,41,0.35)',
          }}>
            P
          </div>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 18, color: '#FFFFFF', letterSpacing: '0.12em', lineHeight: 1 }}>
              PRIME PACKAGING
            </h1>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>
              B2B Customer Portal
            </p>
          </div>
        </div>

        {/* Middle Content */}
        <div style={{ maxWidth: 520, margin: 'auto 0', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#FFFFFF', fontSize: 12, fontWeight: 700, marginBottom: 24,
          }}>
            <Sparkles size={14} color="#FFB800" /> Real-time Production & Order Tracking
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 44, color: '#FFFFFF',
            lineHeight: 1.15, marginBottom: 20,
          }}>
            Streamline your custom box orders in one place.
          </h2>

          <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            Access active quotes, track order production steps in real-time, review artwork approvals, and download tax invoices effortlessly.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              "Live status updates from production to final delivery",
              "Instant PDF invoice & estimate downloads",
              "Dedicated account executive support & order history",
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.15)', color: '#34D399',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle2 size={14} />
                </div>
                <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#64748B', fontSize: 12, borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24, position: 'relative', zIndex: 2,
        }}>
          <span>© 2026 Prime Packaging Boxes USA.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34D399' }}>
            <ShieldCheck size={14} /> 256-bit SSL Encrypted Portal
          </span>
        </div>
      </div>

      {/* ── RIGHT LOGIN FORM CONTAINER ── */}
      <div style={{
        width: '480px',
        maxWidth: '100%',
        minWidth: '320px',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 40px',
        boxSizing: 'border-box',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
        marginLeft: 'auto',
      }}>
        
        {/* Mobile Header */}
        <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: '#E63329',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 18,
          }}>
            P
          </div>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 14, color: '#0D1F3C' }}>PRIME PACKAGING</h1>
            <p style={{ fontSize: 10, color: '#FFB800', fontWeight: 700, textTransform: 'uppercase' }}>Customer Portal</p>
          </div>
        </div>

        <div style={{ margin: 'auto 0', width: '100%' }}>
          {/* Header text */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 30, color: '#0D1F3C', marginBottom: 6 }}>
              {mode === 'login' ? 'Customer Sign In' : mode === 'forgot' ? 'Forgot Password' : mode === 'reset' ? 'Set New Password' : 'Activate Portal Account'}
            </h3>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              {mode === 'login' ? 'Enter your portal account credentials to continue.' : mode === 'forgot' ? 'We will email a secure, expiring reset link if your account matches.' : mode === 'reset' ? 'Choose a new password for your customer portal.' : 'Choose a password to activate your invitation.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              marginBottom: 24, padding: '12px 16px', borderRadius: 12,
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#DC2626', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: 13, fontWeight: 600 }}>
              ✓ {success}
            </div>
          )}

          {mode === 'login' ? <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Username Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#475569', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                Username or Customer ID
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. customer123 or email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: 12,
                    border: '1.5px solid #E2E8F0',
                    outline: 'none',
                    fontSize: 14,
                    color: '#0F172A',
                    background: '#F8FAFC',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0D1F3C'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#475569', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 42px',
                    borderRadius: 12,
                    border: '1.5px solid #E2E8F0',
                    outline: 'none',
                    fontSize: 14,
                    color: '#0F172A',
                    background: '#F8FAFC',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0D1F3C'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                    display: 'flex', padding: 2,
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: loading ? '#64748B' : '#0D1F3C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(13,31,60,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#E63329'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#0D1F3C'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form> : <form onSubmit={handleLifecycleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {mode === 'forgot' ? 'Username, email, or customer ID' : 'Password'}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                {mode === 'forgot' ? <User size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} /> : <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />}
                <input
                  type={mode === 'forgot' ? 'text' : 'password'}
                  value={mode === 'forgot' ? username : lifecyclePassword}
                  onChange={e => mode === 'forgot' ? setUsername(e.target.value) : setLifecyclePassword(e.target.value)}
                  required
                  minLength={mode === 'forgot' ? undefined : 8}
                  placeholder={mode === 'forgot' ? 'you@company.com' : 'At least 8 characters'}
                  style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, border: '1.5px solid #E2E8F0', outline: 'none', fontSize: 14, color: '#0F172A', background: '#F8FAFC', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 20px', background: loading ? '#64748B' : '#0D1F3C', color: '#FFFFFF', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Please wait…' : mode === 'forgot' ? 'Email Reset Link' : mode === 'reset' ? 'Update Password' : 'Activate Account'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ width: '100%', marginTop: 12, padding: '10px', background: 'transparent', color: '#E63329', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              ← Back to sign in
            </button>
          </form>}

          {mode === 'login' && (
            <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: '#E63329', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'right' }}>
              Forgot password?
            </button>
          )}

          {/* Help Support Notice */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
              Need assistance or portal access?
            </p>
            <a
              href="mailto:help@primepackagingboxes.com"
              style={{ display: 'inline-block', marginTop: 4, fontSize: 13, fontWeight: 700, color: '#E63329', textDecoration: 'none' }}
            >
              help@primepackagingboxes.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 24 }}>
          © 2026 Prime Packaging Boxes USA
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
