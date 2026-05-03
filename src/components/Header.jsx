import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Home, ClipboardList, Info, User, LogIn } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const navItems = [
    { name: 'Главная', path: '/', icon: Home },
    { name: 'Опросы', path: '/tests', icon: ClipboardList },
    { name: 'О нас', path: '/#about', icon: Info },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo-container">
            <div className="logo-icon">
              <Dumbbell className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="logo-text">
              FITPULSE
            </span>
          </Link>
          
          <div className="nav-actions">
            <div className="nav-links">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path.includes('#')
                  ? location.pathname === '/' && location.hash === item.path.split('#')[1]
                  : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-btn-icon" />
                    <span className="nav-btn-text">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="nav-right">
              {token ? (
                <Link
                  to="/profile"
                  className={`nav-btn ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  <User className="nav-btn-icon" />
                  <span className="nav-btn-text">
                    {username || 'Профиль'}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="nav-btn login-btn"
                >
                  <LogIn className="nav-btn-icon" />
                  <span className="nav-btn-text">
                    Вход
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
