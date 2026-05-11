import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthTest: React.FC = () => {
  const { currentUser, isAuthenticated, isHead, isLecturer, login } = useAuth();

  const handleTestLogin = async (email: string, password: string) => {
    console.log('Testing login with:', email, password);
    const result = await login(email, password);
    console.log('Login result:', result);
    console.log('Auth state after login:', { currentUser, isAuthenticated, isHead, isLecturer });
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h2>Auth Test Component</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Auth State:</strong>
        <pre>{JSON.stringify({ currentUser, isAuthenticated, isHead, isLecturer }, null, 2)}</pre>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => handleTestLogin('head@haramaya.edu', 'password')}>
          Test Head Login
        </button>
        <button onClick={() => handleTestLogin('lecturer@haramaya.edu', 'password')} style={{ marginLeft: '10px' }}>
          Test Lecturer Login
        </button>
      </div>
    </div>
  );
};

export default AuthTest;
