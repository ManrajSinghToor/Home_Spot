import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';

export default function Settings() {
  const { user, login, logout } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Local state for username update
  const [username, setUsername] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Local state for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Local state for application preferences
  const [preferences, setPreferences] = useState({
    performance3D: true,
    emailAlerts: true,
    securityLogs: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUsername(user.username || '');
    
    // Load preferences
    const savedPrefs = localStorage.getItem('homespot_preferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user, navigate]);

  const handlePreferenceChange = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem('homespot_preferences', JSON.stringify(updated));
    showToast('Preference updated successfully!', 'success');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Username cannot be empty', 'error');
      return;
    }
    setUpdatingProfile(true);
    try {
      const data = await api.auth.updateProfile(username.trim());
      const updatedUser = {
        ...user,
        username: data.user.username
      };
      login(updatedUser);
      showToast('Username updated successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update username', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    
    let valid = true;
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
      valid = false;
    }

    // Password pattern requirement check
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required.';
      valid = false;
    } else if (!passwordPattern.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must be 8+ characters, and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
      valid = false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      valid = false;
    }

    if (!valid) {
      setPasswordErrors(newErrors);
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.auth.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      showToast('Password changed successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  if (!user) return null;

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '95vh', paddingBottom: '60px', position: 'relative' }}>
        <div className="grid-bg"></div>

        <section className="page-hero" style={{
          padding: '50px 20px',
          textAlign: 'center',
          color: 'var(--light-text)',
          background: 'radial-gradient(circle at center, #1b1b2f, #09090b)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Account Settings</h1>
        </section>

        <section style={{ padding: '40px 0' }}>
          <div className="container grid-responsive-1-2-profile">
            
            {/* Left Column: Account Details & Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Account profile info glass panel */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>
                  Profile Information
                </h3>
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Username</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ width: '100%' }}
                      placeholder="Username"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Email Address (Read-only)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={user.email}
                      disabled
                      style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Account Role (Read-only)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={user.role === 'landlord' ? 'Landlord' : 'Tenant (User)'}
                      disabled
                      style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="glow-btn"
                    disabled={updatingProfile}
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-gradient)', color: '#fff', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}
                  >
                    {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Preferences Settings */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>
                  App Preferences
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Preferences Toggles */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>3D Rendering Mode</h4>
                      <p style={{ color: '#a1a1aa', margin: '4px 0 0 0', fontSize: '0.75rem' }}>Enable hardware acceleration for 3D Tours.</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={preferences.performance3D} 
                        onChange={() => handlePreferenceChange('performance3D')}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: preferences.performance3D ? 'var(--primary-color)' : '#27272a', 
                        transition: '.4s', borderRadius: '34px',
                        boxShadow: preferences.performance3D ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
                      }}>
                        <span style={{
                          position: 'absolute', content: '', height: '18px', width: '18px', left: preferences.performance3D ? '28px' : '4px', bottom: '3px',
                          backgroundColor: '#fff', transition: '.4s', borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>Email Notifications</h4>
                      <p style={{ color: '#a1a1aa', margin: '4px 0 0 0', fontSize: '0.75rem' }}>Receive updates on bookings and favorites.</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={preferences.emailAlerts} 
                        onChange={() => handlePreferenceChange('emailAlerts')}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: preferences.emailAlerts ? 'var(--primary-color)' : '#27272a', 
                        transition: '.4s', borderRadius: '34px',
                        boxShadow: preferences.emailAlerts ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
                      }}>
                        <span style={{
                          position: 'absolute', content: '', height: '18px', width: '18px', left: preferences.emailAlerts ? '28px' : '4px', bottom: '3px',
                          backgroundColor: '#fff', transition: '.4s', borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>Enhanced Security Logs</h4>
                      <p style={{ color: '#a1a1aa', margin: '4px 0 0 0', fontSize: '0.75rem' }}>Log all active sessions and device IPs.</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={preferences.securityLogs} 
                        onChange={() => handlePreferenceChange('securityLogs')}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{ 
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: preferences.securityLogs ? 'var(--primary-color)' : '#27272a', 
                        transition: '.4s', borderRadius: '34px',
                        boxShadow: preferences.securityLogs ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'
                      }}>
                        <span style={{
                          position: 'absolute', content: '', height: '18px', width: '18px', left: preferences.securityLogs ? '28px' : '4px', bottom: '3px',
                          backgroundColor: '#fff', transition: '.4s', borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Security/Password & Sign Out */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Security Panel */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>
                  Update Password
                </h3>
                
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Current Password</label>
                    <input
                      type="password"
                      className="glass-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={{ width: '100%' }}
                      placeholder="Enter current password"
                    />
                    {passwordErrors.currentPassword && (
                      <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{passwordErrors.currentPassword}</span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>New Password</label>
                    <input
                      type="password"
                      className="glass-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={{ width: '100%' }}
                      placeholder="Enter new password"
                    />
                    {passwordErrors.newPassword && (
                      <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block', lineHeight: '1.4' }}>{passwordErrors.newPassword}</span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Confirm New Password</label>
                    <input
                      type="password"
                      className="glass-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      style={{ width: '100%' }}
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>{passwordErrors.confirmPassword}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="glow-btn"
                    disabled={updatingPassword}
                    style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-gradient)', color: '#fff', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}
                  >
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', textAlign: 'left' }}>
                <h3 style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px' }}>
                  Danger Zone
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
                  Logging out will terminate your current session on this device. Make sure your listings and profile revisions are saved.
                </p>
                <button
                  onClick={handleLogout}
                  className="glow-btn"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Terminate Session (Log Out)
                </button>
              </div>

            </div>

          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
