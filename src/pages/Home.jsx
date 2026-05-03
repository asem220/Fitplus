import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Activity, HeartPulse, Dumbbell, Info, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import DotBackground from '../components/DotBackground';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#about') {
      const section = document.getElementById('about');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);
  const features = [
    { icon: Dumbbell, title: 'Построение плана', description: 'Создаем структуру, которая учитывает ваш график, оборудование и цели одновременно.' },
    { icon: HeartPulse, title: 'Контроль прогресса', description: 'Отслеживайте тренировки, восстановление и изменения в теле без разрыва между приложениями.' },
    { icon: Activity, title: 'Фокус на результате', description: 'План построен на данных, чтобы не тратить время на «сложные» и нерабочие упражнения.' },
  ];

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hero-badge"
            >
              <Sparkles className="w-4 h-4" />
              Персональный фитнес рядом
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-title"
            >
              Тренируйся с умом, <br />
              <span className="gradient-text">без лишнего стресса</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hero-description"
            >
              Быстрый старт с готовым опросником, гибкий персональный план и мотивация на каждый день.
              Всё это в одном сайте.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-actions"
            >
              <Link to="/tests" className="btn-primary">
                Пройти опрос
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/#about" className="btn-secondary">
                Узнать больше
              </Link>
            </motion.div>
          </div>

          <div className="hero-images">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="hero-image hero-image-1"
            />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-image hero-image-2"
            />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="hero-image hero-image-3"
            />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hero-image hero-image-4"
            />
          </div>
        </div>

        <DotBackground />
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-list">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="feature-row"
                >
                  <div className="feature-icon-wrapper">
                    <Icon className="feature-icon" />
                  </div>
                  <div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="about-panel"
          >
            <div className="about-intro">
              <span className="about-intro-label">О системе</span>
              <h2 className="about-intro-title">Реальный план, адаптированный к вашему дню</h2>
              <p className="about-intro-text">
                FitPulse не просто предлагает тренировки. Мы учитываем ваш образ жизни, режим сна, питание, опыт и доступный инвентарь.
                В результате вы получаете понятный план на неделю, который можно сразу применять и корректировать через чат с ИИ.
              </p>
            </div>

            <div className="about-grid">
              <div className="about-item">
                <div className="about-item-icon-wrapper">
                  <Info className="about-item-icon" />
                </div>
                <div>
                  <h3 className="about-item-title">Глубокий опрос</h3>
                  <p className="about-item-text">
                    Заполняется один раз, но сразу учитывает цели, ограничения, график, травмы и привычки питания.
                  </p>
                </div>
              </div>

              <div className="about-item">
                <div className="about-item-icon-wrapper">
                  <ShieldCheck className="about-item-icon" />
                </div>
                <div>
                  <h3 className="about-item-title">План под вашу жизнь</h3>
                  <p className="about-item-text">
                    Программа формируется с учётом доступного времени и оборудования, чтобы вы могли тренироваться стабильно даже при плотном графике.
                  </p>
                </div>
              </div>

              <div className="about-item">
                <div className="about-item-icon-wrapper">
                  <Zap className="about-item-icon" />
                </div>
                <div>
                  <h3 className="about-item-title">Чат с ИИ</h3>
                  <p className="about-item-text">
                    Попросите уточнить план, скорректировать нагрузки или адаптировать питание с учётом ваших ежедневных задач.
                  </p>
                </div>
              </div>
            </div>

            <div className="about-metrics">
              <div className="about-metric">
                <strong>18+</strong>
                параметров, которые мы автоматически анализируем
              </div>
              <div className="about-metric">
                <strong>2 шага</strong>
                до готового плана: опрос и диалог с ИИ
              </div>
              <div className="about-metric">
                <strong>1 интерфейс</strong>
                для тренировок, прогресса и общения с ИИ
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
