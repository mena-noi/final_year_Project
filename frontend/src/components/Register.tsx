import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaUser,
  FaEnvelope,
  FaLock,
  FaVolumeUp,
  FaArrowLeft,
  FaSpinner,
  FaGraduationCap,
  FaHeadphones,
  FaShieldAlt
} from "react-icons/fa";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    batchYear: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "General"
  });

  // Welcome message on component mount
  useEffect(() => {
    speak("Welcome to registration. Please fill in your information.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = (text: string) => {
    if (!voiceGuide) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.batchYear || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      speak("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      speak("Passwords do not match");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      speak("Please enter a valid email");
      return;
    }
    
    setError("");
    setIsLoading(true);

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim(),
      batchYear: Number(formData.batchYear),
      department: formData.department
    });

    setIsLoading(false);

    if (!result.ok) {
      const message = result.error || 'Registration failed';
      setError(message);
      speak(message);
      return;
    }

    setSuccess("Registration successful! Redirecting to home.");
    speak("Registration successful! Redirecting to home.");
    setTimeout(() => navigate("/home"), 1400);
  };

  const toggleVoiceGuide = () => {
    setVoiceGuide(!voiceGuide);
    if (!voiceGuide) speak("Voice guidance enabled");
    else window.speechSynthesis.cancel();
  };

  return (
    <div className="register-split">
      {/* Voice Toggle */}
      <button className="voice-toggle-split" onClick={toggleVoiceGuide}>
        <FaVolumeUp className={voiceGuide ? "active" : ""} />
        <span>Voice {voiceGuide ? "ON" : "OFF"}</span>
      </button>

      {/* Back Button */}
      <button className="back-split" onClick={() => navigate("/")}>
        <FaArrowLeft /> Back
      </button>

      <div className="register-split-container">
        {/* Left Side - Form */}
        <div className="register-split-left">
          <div className="register-card">
            <>
              <div className="register-header">
                <h1>Create Account</h1>
                <p>Join our accessible learning community</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label><FaUser /> Full Name *</label>
                  <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label><FaGraduationCap /> Batch Year *</label>
                  <select name="batchYear" value={formData.batchYear} onChange={handleChange}>
                    <option value="">Select your batch year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                  </select>
                </div>

                <div className="form-group">
                  <label><FaEnvelope /> Email *</label>
                  <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label><FaLock /> Password *</label>
                  <input type="password" name="password" placeholder="Create password" value={formData.password} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label><FaLock /> Confirm Password *</label>
                  <input type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="next-btn-split" disabled={isLoading}>
                  {isLoading ? <FaSpinner className="spinner" /> : "Create Account"}
                </button>
              </form>

              <p className="login-link-split">
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </>
          </div>
        </div>

        {/* Right Side - Info/Illustration */}
        <div className="register-split-right">
          <div className="info-content">
            <div className="info-icon-large">
              <FaGraduationCap />
            </div>
            <h2>Welcome to Academic Assistant</h2>
            <p>Your AI-powered learning companion for visually impaired students at Haramaya University</p>
            
            <div className="info-features">
              <div className="info-feature">
                <FaVolumeUp />
                <span>Voice-controlled interface</span>
              </div>
              <div className="info-feature">
                <FaHeadphones />
                <span>Text-to-speech support</span>
              </div>
              <div className="info-feature">
                <FaShieldAlt />
                <span>Secure authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;