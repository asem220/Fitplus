import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация на клиентской стороне
    if (!email || !password) {
      setError('Email и пароль обязательны');
      return;
    }

    if (!email.includes('@')) {
      setError('Пожалуйста, введите корректный email');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/profile');
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте соединение и попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn className="auth-icon" />
          </div>
          <h2 className="auth-title">С возвращением!</h2>
          <p className="auth-subtitle">Войдите в свой аккаунт FitPulse</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Войти
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-text">
          <p>
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-link-btn">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
