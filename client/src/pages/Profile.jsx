import React, { useState, useEffect } from 'react';
import './Profile.css'; 
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';


const Profile = () => {
//   const { user } = useAuth();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({ username: '', email: '' });
  const [preview, setPreview] = useState('/default.png');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      setPreview(`http://localhost:5000${user.profilePicture}`);
    }
  }, [user]);

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
  if (profilePicture) data.append('profilePicture', profilePicture);

  try {
    const res = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: data,
    });

    const result = await res.json();

   if (!res.ok) {
        toast.error(result.message || 'Profile update failed', {
          position: 'top-center',
        });
        return;
      }

    // ✅ Update localStorage & user context
    localStorage.setItem('user', JSON.stringify(result.updatedUser));
    setUser(result.updatedUser); // frontend user context updated instantly

    toast.success('Profile updated successfully!', {
        position: 'top-center',
      });
    } catch {
      toast.error('Something went wrong!', {
        position: 'top-center',
      });
    }
  };



  return (
    <div className="reg-wrapper">
      <form onSubmit={handleSubmit} className="reg-box">
        <h2 className="reg-title">Update Profile</h2>

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

        <button type="submit" className="reg-button">Update</button>
      </form>
    </div>
  );
};

export default Profile;
