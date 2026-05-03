import React from 'react';
import { Link } from 'react-router-dom';
import { quizzes } from '../data/quizzes.js';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Tests() {
  const quiz = quizzes[0];

  return (
    <div className="tests-page">
      <div className="container">
        <div className="tests-header">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tests-title"
          >
            Основной фитнес-опросник
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tests-subtitle"
          >
            Сейчас один тест. Нажмите «Начать опрос» и переходите прямо к содержанию.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="quiz-panel"
        >
          <div className="quiz-panel-head">
            <div className="quiz-icon-wrapper">
              <Dumbbell className="quiz-icon" />
            </div>
            <div>
              <h3 className="quiz-title">{quiz.title}</h3>
              <p className="quiz-description">{quiz.description}</p>
            </div>
          </div>

          <Link to={`/quiz/${quiz.id}`} className="quiz-start-btn">
            Начать опрос
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
