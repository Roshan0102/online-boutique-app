import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext, USER_SERVICE_URL } from '../AppContext';

const Register = () => {
  const { loginAction } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${USER_SERVICE_URL}/api/users/register`, {
        name,
        email,
        password
      });

      const { token, user } = response.data;
      loginAction(user, token);
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration faileds. Email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container glass-panel">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join CloudCart and explore mock shopping</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            className="form-input"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
              Creating Account...
            </span>
          ) : 'Register'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in here</Link>
      </div>
    </div>
  );
};

export default Register;
