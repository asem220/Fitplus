import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="not-found-card"
        >
          <div className="not-found-icon-wrapper">
            <Search className="not-found-icon" />
          </div>
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Страница не найдена</h2>
          <p className="not-found-description">
            Извините, запрашиваемая вами страница не существует или была перемещена.
          </p>
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5" />
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
