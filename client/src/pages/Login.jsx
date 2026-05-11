import { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { loginUser } = useAuth();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/users/login', form);

      loginUser(response.data);

      toast.success('Login successful! Welcome back!', {
        position: 'top-center',
      });

      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-box login-form">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-welcome">
          Sign in to your account to continue your fitness journey
        </p>

        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
          className="login-input"
          disabled={isLoading}
        />

        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          className="login-input"
          disabled={isLoading}
        />

        {/* <div className="forgot-password">
          <a href="#forgot">Forgot your password?</a>
        </div> */}

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-register-link">
          Don't have an account? <Link to="/register">Create one here</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
