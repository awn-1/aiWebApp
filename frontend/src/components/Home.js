import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Home.css';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to the AI Chat Assistant</h1>
          <p>Experience cutting-edge AI technology that assists you with smart conversations and helpful information.</p>
          {user ? (
            <button 
              onClick={() => navigate('/chat')} 
              className="cta-button"
            >
              Start Chatting Now
            </button>
          ) : (
            <button 
              onClick={() => navigate('/auth')} 
              className="cta-button"
            >
              Sign In to Chat
            </button>
          )}
        </div>
      </header>

      <section className="features-section">
        <h2>Why Chat with Our AI?</h2>
        <div className="features">
          <div className="feature-card">
            <h3>Smart Conversations</h3>
            <p>Our AI understands context, providing insightful answers to your questions, no matter how complex they are.</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Responses</h3>
            <p>Get fast, accurate responses in real-time to help you find the information you're looking for quickly.</p>
          </div>
          <div className="feature-card">
            <h3>Available 24/7</h3>
            <p>No matter when you need assistance, our AI is always available to chat and help you with your queries.</p>
          </div>
        </div>
      </section>

      <footer className="footer-section">
        <p>© 2024 AI Chat Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;