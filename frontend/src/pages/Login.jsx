import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';
import InteractiveParticles from '../components/InteractiveParticles';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, login } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // State for form flip toggle
  const [isSignIn, setIsSignIn] = useState(true);
  
  // Mouse tilt states for real-time 3D coordinate mapping
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // State for signup form
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });
  
  // State for login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  
  // State for form errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setErrors({});
  };

  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Mouse Move Tilt Tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 15, y: y * -15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    let valid = true;
    const newErrors = {};

    if (!signupData.username.trim()) {
      newErrors.username = 'Username is required.';
      valid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.co\.in|yahoo\.com|outlook\.com|hotmail\.com|rediffmail\.com)$/i;
    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required.';
      valid = false;
    } else if (!emailPattern.test(signupData.email.trim())) {
      newErrors.email = 'Allowed domains: @gmail.com, @yahoo.co.in, @yahoo.com, @outlook.com, @hotmail.com, @rediffmail.com';
      valid = false;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordPattern.test(signupData.password)) {
      newErrors.password = 'Password must be 8+ characters, including uppercase, lowercase, number, and special character.';
      valid = false;
    }

    if (signupData.confirmPassword !== signupData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.signup({
        username: signupData.username.trim(),
        email: signupData.email.trim(),
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        role: signupData.role
      });

      const currentUser = {
        username: data.user.username,
        email: data.user.email,
        role: data.user.role
      };

      login(currentUser);
      setLoading(false);
      showToast('Registration successful! Welcome to HomeSpot.', 'success');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      const msg = error.message || '';
      if (msg.includes('Username') || msg.includes('username')) {
        newErrors.username = msg;
      } else if (msg.includes('Email') || msg.includes('email')) {
        newErrors.email = msg;
      } else {
        newErrors.general = msg || 'Signup failed. Please try again.';
      }
      setErrors(newErrors);
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    let valid = true;
    const newErrors = {};

    if (!loginData.username.trim()) {
      newErrors.username = 'Username is required.';
      valid = false;
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required.';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.login(loginData.username.trim(), loginData.password, loginData.role);

      const currentUser = {
        username: data.user.username,
        email: data.user.email,
        role: data.user.role
      };

      login(currentUser);
      setLoading(false);
      showToast(`Welcome back, ${currentUser.username}!`, 'success');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.message || '';
      newErrors.general = msg || 'Login failed. Please verify credentials.';
      setErrors(newErrors);
      setLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const flipRotation = isSignIn ? 0 : 180;

  return (
    <PageTransition>
      <Header />
      
      <main style={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '120px 20px 60px',
        background: 'radial-gradient(circle at center, #1b1b2f, #09090b)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          <InteractiveParticles particleColor="rgba(99, 102, 241, 0.25)" lineColor="rgba(99, 102, 241, 0.05)" />
        </div>
        <div className="grid-bg"></div>

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', zIndex: 1 }}>
          <div className="grid-responsive-1-2" style={{ alignItems: 'center', gap: '50px' }}>
            
            {/* LEFT COLUMN: Immersive Info Showcase & Floating Lease Snippet */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.2' }}>
                  Join Punjab's Premier 3D Rental Hub
                </h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.15rem', marginTop: '15px', lineHeight: '1.6' }}>
                  Connecting tenants and property owners across Mohali, Ludhiana, Amritsar, and Jalandhar with cutting-edge visual experiences.
                </p>
              </motion.div>

              {/* Platform Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '10px' }}>
                <div className="glass-panel" style={{ padding: '15px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: '#6366f1', margin: '0 0 5px 0' }}>12K+</h3>
                  <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>Active Tenants</span>
                </div>
                <div className="glass-panel" style={{ padding: '15px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: '#a855f7', margin: '0 0 5px 0' }}>800+</h3>
                  <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>Listings Active</span>
                </div>
                <div className="glass-panel" style={{ padding: '15px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', color: '#10b981', margin: '0 0 5px 0' }}>98%</h3>
                  <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>Match Rate</span>
                </div>
              </div>

              {/* Floating Lease Mock Card */}
              <motion.div
                className="glass-panel float-3d"
                style={{
                  padding: '20px 25px',
                  border: '1.5px solid rgba(168, 85, 247, 0.25)',
                  background: 'rgba(15,15,20,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginTop: '15px',
                  boxShadow: '0 10px 30px rgba(168, 85, 247, 0.15)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  fontSize: '1.2rem'
                }}>
                  <i className="fas fa-file-contract"></i>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600' }}>Tenancy Agreement</span>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', textTransform: 'uppercase', fontWeight: '600' }}>Active</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.8, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: 3D Mouse Tilting Form Card */}
            <div 
              className="perspective-container" 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ width: '100%', maxWidth: '440px', height: '640px', display: 'flex', justifyContent: 'center' }}
            >
              <div 
                className={`flip-card-inner ${isSignIn ? '' : 'flipped'}`} 
                style={{ 
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x + flipRotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                  boxShadow: '0 0 50px rgba(99, 102, 241, 0.3)', 
                  borderRadius: '16px',
                  border: '1.5px solid rgba(99, 102, 241, 0.4)'
                }}
              >
                
                {/* FRONT SIDE (SIGN IN) */}
                <div className="flip-card-front glass-panel" style={{
                  padding: '40px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  border: 'none',
                  height: '100%',
                  background: 'rgba(15, 15, 20, 0.88)'
                }}>
                  
                  {/* Concentric Rotating Hologram Rings */}
                  <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '80px', marginBottom: '15px' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      style={{
                        position: 'absolute',
                        width: '60px',
                        height: '60px',
                        border: '2px dashed rgba(99, 102, 241, 0.5)',
                        borderRadius: '50%',
                        filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.6))'
                      }}
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        width: '40px',
                        height: '40px',
                        border: '2px dotted rgba(168, 85, 247, 0.6)',
                        borderRadius: '50%',
                        filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1rem'
                      }}
                    >
                      <i className="fas fa-lock-open"></i>
                    </motion.div>
                  </div>

                  <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>Welcome Back</h2>
                  <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '25px', fontSize: '0.9rem' }}>Sign in to manage listings or book rentals.</p>
                  
                  {errors.general && (
                    <div style={{
                      padding: '10px 12px',
                      marginBottom: '15px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      color: '#fca5a5',
                      textAlign: 'center',
                      fontSize: '0.85rem'
                    }}>
                      {errors.general}
                    </div>
                  )}
                  
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-user" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      <input 
                        type="text" 
                        name="username"
                        placeholder="Username" 
                        value={loginData.username}
                        onChange={handleLoginChange}
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        required
                      />
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-lock" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      <input 
                        type="password" 
                        name="password"
                        placeholder="Password" 
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        required
                      />
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-user-tag" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a', zIndex: 1 }}></i>
                      <select 
                        name="role"
                        value={loginData.role}
                        onChange={handleLoginChange}
                        className="glass-select"
                        style={{ width: '100%', paddingLeft: '45px' }}
                      >
                        <option value="user">Tenant (User)</option>
                        <option value="landlord">Landlord</option>
                      </select>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="glow-btn"
                      disabled={loading}
                      style={{
                        padding: '13px 0',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'var(--primary-color)',
                        background: 'var(--primary-gradient)',
                        color: '#fff',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      {loading ? 'Verifying Credentials...' : 'Sign In'}
                    </button>
                    
                    <p style={{ margin: '15px 0 0', fontSize: '.85rem', textAlign: 'center', color: '#71717a' }}>
                      Don't have an account?{' '}
                      <span 
                        onClick={toggleForm} 
                        style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--primary-color)' }}
                      >
                        Sign up here
                      </span>
                    </p>
                  </form>
                </div>

                {/* BACK SIDE (SIGN UP) */}
                <div className="flip-card-back glass-panel" style={{
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'rgba(12, 12, 16, 0.96)',
                  height: '100%'
                }}>
                  
                  {/* Spinning Hologram Sparkles */}
                  <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '60px', marginBottom: '10px' }}>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                      style={{
                        position: 'absolute',
                        width: '50px',
                        height: '50px',
                        border: '2px dashed rgba(168, 85, 247, 0.5)',
                        borderRadius: '50%',
                        filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))'
                      }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        color: '#a855f7',
                        fontSize: '1.2rem'
                      }}
                    >
                      <i className="fas fa-user-plus"></i>
                    </motion.div>
                  </div>

                  <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>Create Account</h2>
                  <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '20px', fontSize: '0.85rem' }}>Join HomeSpot to list or book homes in Punjab.</p>
                  
                  {errors.general && (
                    <div style={{
                      padding: '8px 10px',
                      marginBottom: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      color: '#fca5a5',
                      textAlign: 'center',
                      fontSize: '0.85rem'
                    }}>
                      {errors.general}
                    </div>
                  )}
                  
                  <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-user" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      <input 
                        type="text" 
                        name="username"
                        placeholder="Username" 
                        value={signupData.username}
                        onChange={handleSignupChange}
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        required
                      />
                      {errors.username && (
                        <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block', paddingLeft: '5px' }}>{errors.username}</span>
                      )}
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-envelope" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Email Address" 
                        value={signupData.email}
                        onChange={handleSignupChange}
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        required
                      />
                      {errors.email && (
                        <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block', paddingLeft: '5px' }}>{errors.email}</span>
                      )}
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-user-tag" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a', zIndex: 1 }}></i>
                      <select 
                        name="role"
                        value={signupData.role}
                        onChange={handleSignupChange}
                        className="glass-select"
                        style={{ width: '100%', paddingLeft: '45px' }}
                      >
                        <option value="user">Tenant (User)</option>
                        <option value="landlord">Landlord</option>
                      </select>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-lock" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      <input 
                        type="password" 
                        name="password"
                        placeholder="Password" 
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        required
                      />
                      {errors.password && (
                        <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block', paddingLeft: '5px' }}>{errors.password}</span>
                      )}
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <i className="fas fa-lock" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder="Confirm Password" 
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        className="glass-input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        required
                      />
                      {errors.confirmPassword && (
                        <span style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '3px', display: 'block', paddingLeft: '5px' }}>{errors.confirmPassword}</span>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      className="glow-btn"
                      disabled={loading}
                      style={{
                        padding: '12px 0',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'var(--primary-color)',
                        background: 'var(--primary-gradient)',
                        color: '#fff',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '5px'
                      }}
                    >
                      {loading ? 'Registering Account...' : 'Sign Up'}
                    </button>
                    
                    <p style={{ margin: '10px 0 0', fontSize: '.85rem', textAlign: 'center', color: '#71717a' }}>
                      Already have an account?{' '}
                      <span 
                        onClick={toggleForm} 
                        style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--primary-color)' }}
                      >
                        Sign in here
                      </span>
                    </p>
                  </form>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </PageTransition>
  );
}