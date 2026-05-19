import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav>
      <Link to="/" className="brand">🏛️ Complaint System</Link>
      <div>
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/complaints">Complaints</Link>
            <Link to="/new-complaint">+ New</Link>
            <span style={{ color: '#aaa', marginLeft: 16, fontSize: 13 }}>
              Hi, {user.name} {user.role === 'admin' && '(Admin)'}
            </span>
            <button onClick={handleLogout} style={{ marginLeft: 12 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
