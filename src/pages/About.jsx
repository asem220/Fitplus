import React from 'react';
import { motion } from 'motion/react';
import { Info, HelpCircle, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="about-page">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="about-card"
        >
          <div className="about-header">
            <div className="about-icon-wrapper">
              <Info className="about-icon" />
            </div>
            <h1 className="about-title">О системе планирования</h1>
          </div>
          
          <div className="about-content">
            <p className="about-text">
              Наша платформа помогает собрать индивидуальную тренировочную программу на основе ваших целей, режима и уровня подготовки.
            </p>
            
            <div className="about-grid">
              <div className="about-feature-card yellow">
                <HelpCircle className="about-feature-icon" />
                <h3 className="about-feature-title">Персональный опрос</h3>
                <p className="about-feature-description">Мы собираем данные о вашем опыте, целях и восстановлении для создания плана.</p>
              </div>
              <div className="about-feature-card purple">
                <ShieldCheck className="about-feature-icon" />
                <h3 className="about-feature-title">Адаптивная программа</h3>
                <p className="about-feature-description">План корректируется с учетом прогресса, нагрузки и состояния.</p>
              </div>
            </div>
            
            <p className="about-text">
              Независимо от уровня подготовки, мы помогаем транслировать цели в понятный и безопасный тренировочный режим.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
