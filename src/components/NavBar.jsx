import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import useAuth from '../hooks/useAuth'; 
import '../styles/NavBar.css';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className={`logo desktop-logo`}>Christian's Learning</div>

      <div
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </div>

      <div className="logo mobile-logo-bar">Christian's Learning</div>

      <ul className={`nav-links ${menuOpen ? 'mobile-menu' : ''}`}>
        {menuOpen && (
          <li className="mobile-logo-menu">Christian's Learning</li>
        )}
        <li>
          <NavLink to="/" end onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/lessons" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
            Lessons
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" onClick={handleNavClick} className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        {user && (
          <li>
            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
