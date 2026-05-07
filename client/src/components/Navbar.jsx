
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';
// import { useTheme } from '../context/ThemeContext';
// import { FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
  // const { theme, toggleTheme } = useTheme();
  const { user, logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="logo">
  <img src="logo.png" alt="Fitness Tracker" className="logo-img" />

</Link>

      {/* Hamburger for mobile */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/workouts" onClick={() => setMenuOpen(false)}>Workouts</Link>
        <Link to="/progress" onClick={() => setMenuOpen(false)}>Progress</Link>
        <Link to="/nutrition" onClick={() => setMenuOpen(false)}>Nutrition</Link>
      </div>

      <div className="nav-actions">
        {/* <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button> */}

        {!user ? (
          <div className="auth-links">
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </div>
        ) : (
          <div className="profile-container" ref={dropdownRef}>
            <img
              src={`http://localhost:5000${user.profilePicture}`}
              alt="profile"
              className="profile-pic"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {dropdownOpen && (
              <div className="dropdown-menu-advanced">
                <button className="dropdown-close" onClick={() => setDropdownOpen(false)}>✖</button>
                <p className="user-email">{user.email}</p>
                <div className="user-center">
                  <img src={`http://localhost:5000${user.profilePicture}`} alt="profile" />
                  <h4>Hi! {user.username}</h4>
                </div>
                <div className="dropdown-divider"></div>
                {/* <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>🏠 Dashboard</button> */}
                <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>👤 Profile</button>
                <button onClick={handleLogout}>
                  <FiLogOut style={{ marginRight: '6px' }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
