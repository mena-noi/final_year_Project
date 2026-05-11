import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaEnvelope,
  FaLock,
  FaVolumeUp,
  FaArrowLeft,
  FaKey,
  FaSpinner
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Welcome message on component mount
  useEffect(() => {
    speak("Welcome to login. Please enter your email and password.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const speak = (text: string) => {
    if (!voiceGuide) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      speak("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    speak("Verifying credentials...");

    const result = await login(email, password);
    setIsLoading(false);

    if (!result.ok) {
      const message = result.error || "Invalid email or password";
      setError(message);
      speak(message);
      return;
    }

    setSuccess("Login successful! Welcome back!");
    speak("Login successful! Redirecting to dashboard.");

    const targetRoute = result.role === 'lecturer' || result.role === 'department_head'
      ? "/admin"
      : "/home";

    setTimeout(() => navigate(targetRoute), 1200);
  };

  const toggleVoiceGuide = () => {
    setVoiceGuide(!voiceGuide);
    if (!voiceGuide) speak("Voice guidance enabled");
    else window.speechSynthesis.cancel();
  };

  return (
    <div className="login-split">
      {/* Voice Toggle */}
      <button className="voice-toggle-login" onClick={toggleVoiceGuide}>
        <FaVolumeUp className={voiceGuide ? "active" : ""} />
        <span>Voice {voiceGuide ? "ON" : "OFF"}</span>
      </button>

      {/* Back Button */}
      <button className="back-login" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back
      </button>

      <div className="login-split-container">
        {/* Left Side - Login Form */}
        <div className="login-split-left">
          <div className="login-card">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account</p>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin}>
              <div className="form-group">
                <label><FaEnvelope /> Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => speak("Enter your email address")}
                />
              </div>

              <div className="form-group">
                <label><FaLock /> Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => speak("Enter your password")}
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" /> Remember me
                </label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? <FaSpinner className="spinner" /> : <FaKey />}
                {isLoading ? " Logging in..." : " Sign In"}
              </button>
            </form>

            <p className="signup-link">
              Don't have an account? <a href="/register">Sign up</a>
            </p>
          </div>
        </div>

        {/* Right Side - Info/Illustration */}
        <div className="login-split-right">
          <div className="info-content-login">
            <div className="info-icon-large">
              <FaEnvelope />
            </div>
            <h2>Secure Login</h2>
            <p>Sign in with your email and password</p>
            
            <div className="login-methods-info">
              <div className="method-info">
                <FaLock />
                <div>
                  <strong>Secure Authentication</strong>
                  <span>Safe and reliable login system</span>
                </div>
              </div>
              <div className="method-info">
                <FaEnvelope />
                <div>
                  <strong>Email Login</strong>
                  <span>Traditional email and password</span>
                </div>
              </div>
            </div>

            <div className="voice-tip">
              <FaVolumeUp />
              <p>Voice guidance available for accessibility</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;