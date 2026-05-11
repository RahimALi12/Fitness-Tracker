import React, { useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [preview, setPreview] = useState('/default.png');
  const [profilePicture, setProfilePicture] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('profilePicture', profilePicture);

   try {
    const res = await fetch('api/users/register', {
      method: 'POST',
      body: data,
    });

    const result = await res.json();

    if (res.ok) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  } catch (error) {
    toast.error('Something went wrong!');
    console.error(error);
  }
};

  return (
    <div className="reg-wrapper">
      <form onSubmit={handleSubmit} className="reg-box">
        <h2 className="reg-title">Join FitZone</h2>

        <div className="reg-image-upload">
          <img src={preview} alt="Preview" className="reg-profile-pic" />
          <label htmlFor="file-input" className="reg-camera-icon">📷</label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="reg-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="reg-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="reg-input"
        />

        <button type="submit" className="reg-button">Register</button>

        <p className="reg-login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
