import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzes } from '../data/quizzes.js';
import { ArrowLeft, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = quizzes.find((q) => q.id === id);

  const sections = quiz?.sections || [];
  const questions = sections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      sectionTitle: section.title,
      sectionDescription: section.description,
      sectionId: section.id
    }))
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [plan, setPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(null);

  const sanitizeAIText = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/\r\n|\r/g, '\n')
      .replace(/^\s*#{1,6}\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\|/g, '')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const totalQuestions = questions.length;
  const currentAnswer = answers[currentQuestion];

  const currentSectionIndex = sections.reduce((activeIndex, section, sectionIndex) => {
    const pastQuestions = sections.slice(0, sectionIndex).reduce((sum, item) => sum + item.questions.length, 0);
    return currentQuestion >= pastQuestions && currentQuestion < pastQuestions + section.questions.length
      ? sectionIndex
      : activeIndex;
  }, 0);

  const currentQ = questions[currentQuestion];
  const currentAnswerValue = currentQ?.type === 'multi' ? currentAnswer || [] : currentAnswer;

  const isAnswered = (value) => {
    if (!currentQ) return false;
    if (currentQ.type === 'multi') return Array.isArray(value) && value.length > 0;
    if (currentQ.type === 'text' || currentQ.type === 'textarea') return value !== null && value !== undefined && value !== '';
    if (currentQ.type === 'number') return value !== null && value !== undefined && value !== '';
    return value !== null && value !== undefined;
  };

  const handleOptionSelect = (option) => {
    setAnswers((prev) => {
      const nextAnswers = [...prev];
      nextAnswers[currentQuestion] = option;
      return nextAnswers;
    });
  };

  const handleToggleOption = (option) => {
    setAnswers((prev) => {
      const nextAnswers = [...prev];
      const currentValues = Array.isArray(nextAnswers[currentQuestion]) ? nextAnswers[currentQuestion] : [];
      if (currentValues.includes(option)) {
        nextAnswers[currentQuestion] = currentValues.filter((item) => item !== option);
      } else {
        nextAnswers[currentQuestion] = [...currentValues, option];
      }
      return nextAnswers;
    });
  };

  const handleInputChange = (value) => {
    setAnswers((prev) => {
      const nextAnswers = [...prev];
      nextAnswers[currentQuestion] = value;
      return nextAnswers;
    });
  };

  if (!quiz) {
    return (
      <div className="quiz-page">
        <div className="text-center">
          <h2 className="results-title">Опрос не найден</h2>
          <button
            onClick={() => navigate('/tests')}
            className="btn-secondary mt-4"
          >
            Назад к опросам
          </button>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    const answersMap = Object.fromEntries(
      questions.map((question, index) => [question.id, answers[index]])
    );

    const token = localStorage.getItem('token');
    if (token) {
      setSaving(true);
      setSaveError(null);
      try {
        const response = await fetch('/api/quiz/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quizId: quiz.id,
            answers,
            totalQuestions
          })
        });

        if (!response.ok) {
          const error = await response.json();
          setSaveError(error.error || 'Ошибка при сохранении данных');
        }
      } catch (error) {
        console.error('Failed to save quiz result:', error);
        setSaveError('Ошибка сети при сохранении данных. Результат может не быть сохранен.');
      } finally {
        setSaving(false);
      }
    }

    setPlanLoading(true);
    setPlanError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ answers: answersMap })
      });

      const result = await response.json();
      if (!response.ok) {
        setPlanError(result.error || 'Ошибка генерации плана');
      } else {
        setPlan(sanitizeAIText(result.plan || 'План не получен'));
      }
    } catch (error) {
      console.error('AI plan request error:', error);
      setPlanError('Ошибка подключения к серверу ИИ. Попробуйте позже.');
    } finally {
      setPlanLoading(false);
    }

    setShowResults(true);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(null));
    setShowResults(false);
    setSaving(false);
    setSaveError(null);
    setPlan('');
    setPlanLoading(false);
    setPlanError(null);
  };

  if (showResults) {
    return (
      <div className="quiz-page">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="results-card"
          >
            <div className="results-icon-wrapper">
              <Trophy className="results-icon" />
            </div>
            <h2 className="results-title">Опрос завершен!</h2>
            <p className="results-subtitle">Спасибо, вы завершили опрос "{quiz.title}".</p>

            {saving && <p className="status-note">Сохранение данных...</p>}
            {saveError && <div className="status-error">{saveError}</div>}

            <div className="results-score-big">
              Готово
            </div>

            <p className="results-text mb-4">
              Мы используем ваши ответы для создания персональной системы тренировок.
            </p>
            <p className="results-text mb-4">
              ИИ формирует для вас персональный недельный план на основании ответов.
            </p>

            {planLoading && <p className="status-note">ИИ генерирует план...</p>}
            {planError && <div className="status-error">{planError}</div>}
            {plan && (
              <div className="ai-plan-card">
                <h3 className="results-subtitle">Персональный AI-план</h3>
                <pre className="ai-plan-text">{plan}</pre>
              </div>
            )}

            <div className="results-actions">
              <button onClick={handleRestart} className="btn-secondary btn-small" disabled={saving}>
                <RotateCcw className="icon-inline" />
                Заново
              </button>
              <button onClick={() => navigate('/tests')} className="btn-primary btn-small" disabled={saving}>
                К списку опросов
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-nav">
          <button onClick={() => navigate('/tests')} className="btn-secondary btn-small quiz-back-btn">
            <ArrowLeft className="icon-inline" />
            Выйти
          </button>
          <div className="quiz-progress">
            Вопрос {currentQuestion + 1} из {totalQuestions}
          </div>
        </div>

        <motion.div 
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="quiz-card"
        >
          <div className="quiz-section-header">
            <span className="section-label">
              Блок {currentSectionIndex + 1}: {sections[currentSectionIndex]?.title}
            </span>
            <p className="section-description">
              {sections[currentSectionIndex]?.description}
            </p>
          </div>
          <h3 className="quiz-question">{currentQ.question}</h3>
          
          <div className="options-list">
            {currentQ.type === 'single' && currentQ.options?.map((option, index) => {
              const isSelected = option === currentAnswerValue;
              const buttonClass = isSelected ? 'option-btn selected' : 'option-btn';

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={buttonClass}
                  type="button"
                >
                  <span>{option}</span>
                </button>
              );
            })}

            {currentQ.type === 'multi' && currentQ.options?.map((option, index) => {
              const selectedOptions = currentAnswerValue || [];
              const isSelected = selectedOptions.includes(option);
              const buttonClass = isSelected ? 'option-btn selected' : 'option-btn';

              return (
                <button
                  key={index}
                  onClick={() => handleToggleOption(option)}
                  className={buttonClass}
                  type="button"
                >
                  <span>{option}</span>
                </button>
              );
            })}

            {(currentQ.type === 'text' || currentQ.type === 'number') && (
              <input
                className="survey-input"
                type={currentQ.type === 'number' ? 'number' : 'text'}
                value={currentAnswerValue ?? ''}
                onChange={(e) => handleInputChange(currentQ.type === 'number' ? e.target.value : e.target.value)}
                placeholder={currentQ.placeholder || 'Введите ответ'}
              />
            )}

            {currentQ.type === 'textarea' && (
              <textarea
                className="survey-textarea"
                value={currentAnswerValue ?? ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentQ.placeholder || 'Напишите ответ'}
              />
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="quiz-footer"
          >
            {currentQuestion > 0 && (
              <button onClick={handlePrevious} className="btn-secondary btn-small" type="button">
                Назад
              </button>
            )}
            <button onClick={handleNext} className="btn-primary" type="button" disabled={!isAnswered(currentAnswerValue)}>
              {currentQuestion + 1 === totalQuestions ? 'Завершить опрос' : 'Дальше'}
              <ArrowRight className="icon-inline" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}