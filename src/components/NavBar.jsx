import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import useAuth from '../hooks/useAuth'; 
import '../styles/NavBar.css';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">Christian's Learning</div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/lessons" className={({ isActive }) => isActive ? 'active' : ''}>
            Lessons
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
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
