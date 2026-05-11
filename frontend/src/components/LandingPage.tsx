import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  FaRobot, 
  FaMicrophone, 
  FaHeadphones, 
  FaShieldAlt, 
  FaArrowRight,
  FaUsers,
  FaBookOpen,
  FaComments,
  FaBell,
  FaChartLine,
  FaGraduationCap,
  FaStar,
  FaPlayCircle,
  FaCheckCircle,
  FaBrain,
  FaClock,
  FaLanguage,
  FaRegSmile,
  FaQuoteLeft,
  FaArrowLeft,
  FaArrowRight as FaArrowRightIcon,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone
} from "react-icons/fa";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const resolved = i18n.resolvedLanguage || "en";
  const currentLanguageLabel = resolved.startsWith("am")
    ? "Amharic"
    : resolved.startsWith("or")
      ? "Oromo"
      : "English";
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVoiceDemoPlaying, setIsVoiceDemoPlaying] = useState(false);
  const [demoText, setDemoText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const message = new SpeechSynthesisUtterance(
      "Welcome to the Accessible Academic Assistant. Your voice-controlled learning companion for visually impaired students at Haramaya University."
    );
    message.rate = 0.9;
    window.speechSynthesis.speak(message);
    
    // Scroll listener for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      text: "This platform has completely transformed how I study. The voice commands make it so easy to navigate, and the AI assistant helps me understand complex topics instantly. It's truly life-changing for visually impaired students.",
      author: "Dr. Elias Kemal",
      title: "Head of Department, Computer Science",
      rating: 5,
      avatar: "EK"
    },
    {
      text: "As a visually impaired student, I've never had such an accessible learning experience. The voice guidance is perfect, and the ability to ask questions naturally makes learning so much easier.",
      author: "Meron Tesfaye",
      title: "Computer Science Student",
      rating: 5,
      avatar: "MT"
    },
    {
      text: "The AI assistant understands my needs perfectly. It reads out course materials, reminds me of deadlines, and helps me understand difficult concepts. A game-changer for inclusive education.",
      author: "Abebe Bekele",
      title: "Engineering Student",
      rating: 5,
      avatar: "AB"
    }
  ];

  const playVoiceDemo = () => {
    setIsVoiceDemoPlaying(true);
    const demoMessages = [
      "Hello! I'm your AI assistant. You can ask me anything.",
      "For example, say 'What is photosynthesis?'",
      "Or 'When is my math assignment due?'",
      "I'll read everything aloud for you."
    ];
    
    let index = 0;
    setDemoText(demoMessages[index]);
    
    const speakNext = () => {
      if (index < demoMessages.length) {
        const utterance = new SpeechSynthesisUtterance(demoMessages[index]);
        utterance.rate = 0.9;
        utterance.onend = () => {
          index++;
          if (index < demoMessages.length) {
            setDemoText(demoMessages[index]);
            speakNext();
          } else {
            setIsVoiceDemoPlaying(false);
          }
        };
        window.speechSynthesis.speak(utterance);
      }
    };
    
    speakNext();
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <FaGraduationCap className="logo-icon" />
            <span>{t("appName")}</span>
          </div>
          <div className="nav-links">
            <a href="#features">{t("features")}</a>
            <a href="#how-it-works">{t("howItWorks")}</a>
            <a href="#accessibility">{t("accessibility")}</a>
          </div>
          <div className="nav-buttons">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 10, position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowLangMenu((prev) => !prev)}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 9999,
                  padding: "7px 12px",
                  background: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
                aria-label={t("language")}
                title={t("language")}
              >
                <span>🌐</span>
                <span style={{ fontSize: 22, lineHeight: 0.6 }}>{currentLanguageLabel}</span>
                <span style={{ fontSize: 16 }}>⌄</span>
              </button>
              {showLangMenu && (
                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    padding: 6,
                    background: "#fff",
                    fontSize: 13,
                    position: "absolute",
                    top: "120%",
                    right: 0,
                    minWidth: 130,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                  }}
                >
                  {[
                    { code: "en", label: "English" },
                    { code: "am", label: "Amharic" },
                    { code: "or", label: "Oromo" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: resolved.startsWith(lang.code) ? "#f3f4f6" : "transparent",
                        color: "#111827",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 10px",
                        cursor: "pointer"
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-login" onClick={() => navigate("/login")}>{t("login")}</button>
            <button className="btn-signup" onClick={() => navigate("/register")}>{t("signup")}</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaStar className="badge-icon" />
              <span>{t("universityName")}</span>
            </div>
            <h1 className="hero-title">
              {t("landingHeroLine1")}
              <span className="gradient-text"> {t("landingHeroLine2")}</span>
            </h1>
            <p className="hero-description">
              {t("landingHeroDescription")}
            </p>
            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={() => navigate("/register")}>
                {t("getStarted")} <FaArrowRight />
              </button>
              <button className="btn-secondary-large" onClick={playVoiceDemo}>
                <FaPlayCircle /> {t("tryVoiceDemo")}
              </button>
            </div>
            
            {/* Voice Demo Indicator */}
            {isVoiceDemoPlaying && (
              <div className="voice-demo-indicator">
                <div className="demo-voice-wave">
                  <span></span><span></span><span></span><span></span>
                </div>
                <p className="demo-text">"{demoText}"</p>
              </div>
            )}
            
            <div className="hero-stats">
              {[
                { number: "24/7", label: "AI Support", icon: FaRobot },
                { number: "100%", label: "Voice Controlled", icon: FaMicrophone },
                { number: "3+", label: "Languages", icon: FaLanguage },
                { number: "500+", label: "Active Students", icon: FaUsers }
              ].map((stat, index) => (
                <div key={index} className="hero-stat">
                  <stat.icon className="stat-icon" />
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="voice-animation">
              <div className="voice-circle"></div>
              <div className="voice-circle-2"></div>
              <div className="voice-waves">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div className="floating-card voice-card">
                <FaMicrophone /> "What is photosynthesis?"
              </div>
              <div className="floating-card response-card">
                <FaRobot /> "Photosynthesis is the process..."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t("features")}</span>
            <h2>{t("landingFeaturesTitle")}</h2>
            <p>{t("landingFeaturesDesc")}</p>
          </div>
          <div className="features-grid">
            {[
              { icon: FaComments, title: "AI Chat Assistant", desc: "Get instant answers to your academic questions", color: "#667eea" },
              { icon: FaMicrophone, title: "Voice Commands", desc: "Control everything with your voice", color: "#10b981" },
              { icon: FaBell, title: "Smart Reminders", desc: "Never miss important deadlines", color: "#f59e0b" },
              { icon: FaBookOpen, title: "Learning Modules", desc: "Access course materials easily", color: "#ef4444" },
              { icon: FaChartLine, title: "Track Progress", desc: "Monitor your learning journey", color: "#8b5cf6" },
              { icon: FaHeadphones, title: "Text-to-Speech", desc: "Listen to content read aloud", color: "#06b6d4" }
            ].map((feature, index) => (
              <div key={index} className="feature-card animate-on-scroll">
                <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t("simpleProcess")}</span>
            <h2>{t("howItWorks")}</h2>
            <p>{t("landingHowDesc")}</p>
          </div>
          <div className="steps-grid">
            {[
              { number: "01", title: "Ask a Question", desc: "Speak or type your academic question", icon: FaMicrophone },
              { number: "02", title: "AI Processes", desc: "Our AI understands and analyzes your query", icon: FaBrain },
              { number: "03", title: "Get Response", desc: "Receive voice or text guidance instantly", icon: FaHeadphones }
            ].map((step, index) => (
              <div key={index} className="step-card animate-on-scroll">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <step.icon />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-carousel">
            <button className="carousel-btn prev" onClick={prevTestimonial}>
              <FaArrowLeft />
            </button>
            <div className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <p className="testimonial-text">{testimonials[activeTestimonial].text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonials[activeTestimonial].avatar}</div>
                <div>
                  <strong>{testimonials[activeTestimonial].author}</strong>
                  <span>{testimonials[activeTestimonial].title}</span>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star filled" />
                ))}
              </div>
            </div>
            <button className="carousel-btn next" onClick={nextTestimonial}>
              <FaArrowRightIcon />
            </button>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${activeTestimonial === index ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="accessibility-section">
        <div className="container">
          <div className="accessibility-grid">
            <div className="accessibility-content">
              <span className="column-badge">{t("builtForAccessibility")}</span>
              <h2>{t("designedForVisuallyImpaired")}</h2>
              <p>{t("accessibilityDescription")}</p>
              <ul className="feature-list">
                <li><FaCheckCircle /> Full voice control navigation</li>
                <li><FaCheckCircle /> Text-to-speech for all content</li>
                <li><FaCheckCircle /> High contrast mode</li>
                <li><FaCheckCircle /> Screen reader compatible</li>
                <li><FaCheckCircle /> Keyboard shortcuts</li>
              </ul>
            </div>
            <div className="accessibility-visual">
              <div className="accessibility-card">
                <FaHeadphones className="access-icon" />
                <div className="voice-bars">
                  <span></span><span></span><span></span><span></span>
                </div>
                <p>Voice guidance active</p>
                <div className="access-badges">
                  <span>Screen Reader</span>
                  <span>High Contrast</span>
                  <span>Keyboard Nav</span>
                  <span>Voice Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t("landingCtaTitle")}</h2>
            <p>{t("landingCtaDesc")}</p>
            <div className="cta-buttons">
              <button className="btn-primary-large" onClick={() => navigate("/login")}>
                {t("loginToAccount")}
              </button>
              <button className="btn-outline-large" onClick={() => navigate("/register")}>
                {t("createFreeAccount")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <FaGraduationCap />
                <span>{t("appName")}</span>
              </div>
              <p>{t("landingFooterSupport")}</p>
              <p className="footer-university">{t("universityName")}</p>
              <div className="social-links">
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaLinkedin /></a>
                <a href="#"><FaGithub /></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>{t("product")}</h4>
              <a href="#features">{t("features")}</a>
              <a href="#how-it-works">{t("howItWorks")}</a>
              <a href="#accessibility">{t("accessibility")}</a>
            </div>
            <div className="footer-links">
              <h4>{t("resources")}</h4>
              <a href="#">Documentation</a>
              <a href="#">Help Center</a>
              <a href="#">Voice Commands</a>
            </div>
            <div className="footer-links">
              <h4>{t("company")}</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div className="footer-contact">
              <h4>{t("contact")}</h4>
              <p><FaEnvelope /> support@academicassistant.com</p>
              <p><FaPhone /> +251-XXX-XXXX</p>
              <p><FaMapMarkerAlt /> Haramaya University, Ethiopia</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t("copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;