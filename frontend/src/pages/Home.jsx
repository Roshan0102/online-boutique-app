import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../AppContext';

const Home = () => {
  const { user } = useContext(AppContext);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge badge-indigo" style={{ marginBottom: '16px' }}>
            Powered by Microservices Architecture
          </div>
          <h1 className="hero-title">
            Next-Gen E-Commerce <br />
            <span className="hero-gradient-text">Built on CloudTech</span>
          </h1>
          <p className="hero-description">
            Experience lightning-fast shopping on CloudCart, a mock production-grade microservices application designed for Docker, Kubernetes, and modern GitOps workflows.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              Explore Products
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-glow-circle"></div>
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80" 
            alt="Dashboard mockup" 
            className="hero-image"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why CloudCart?</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">🚀</div>
            <h3>Microservices Under the Hood</h3>
            <p>Built with decoupled User, Product, and Order services communicating over Docker networks via REST APIs.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon">🛡️</div>
            <h3>JWT-Secured Transactions</h3>
            <p>Standardized stateless sessions using secure JWT token verification, database transactions, and password hashing.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon">🐳</div>
            <h3>DevOps & Cloud Ready</h3>
            <p>Includes multi-stage builds, non-root users, healthchecks, and PostgreSQL database segregation, ready for Helm and AWS EKS.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
