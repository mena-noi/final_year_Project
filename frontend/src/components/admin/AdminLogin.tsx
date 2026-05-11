import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaSignInAlt, FaShieldAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLogin.css';

interface AdminLoginProps {
  /** Optional; session is driven by AuthContext after login. */
  onLogin?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptedRole, setAttemptedRole] = useState<'lecturer' | 'department_head' | null>(null);
  const { adminLogin, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!attemptedRole) return;
    
    setIsLoading(true);
    
    try {
      const result = await adminLogin(email, password, attemptedRole);
      if (!result.ok) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }
      setError('');
      onLogin?.();
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon-wrapper">
            <FaUserShield className="admin-icon" />
          </div>
          <h1>Staff Portal</h1>
          <p>Sign in to access your administrative dashboard.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label><FaEnvelope /> Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="admin-form-group">
            <label><FaLock /> Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {showPassword ? '👁' : '👁'}
              </button>
            </div>
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <div className="admin-login-actions">
            <button 
              type="submit" 
              className={`admin-login-btn lecturer ${isLoading && attemptedRole === 'lecturer' ? 'loading' : ''}`}
              disabled={isLoading}
              onClick={() => setAttemptedRole('lecturer')}
            >
              {isLoading && attemptedRole === 'lecturer' ? (
                'Authenticating...'
              ) : (
                <>
                  <FaSignInAlt /> Lecturer Sign In
                </>
              )}
            </button>

            <button 
              type="submit" 
              className={`admin-login-btn head ${isLoading && attemptedRole === 'department_head' ? 'loading' : ''}`}
              disabled={isLoading}
              onClick={() => setAttemptedRole('department_head')}
            >
              {isLoading && attemptedRole === 'department_head' ? (
                'Authenticating...'
              ) : (
                <>
                  <FaShieldAlt /> Head Sign In
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;