import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Award, Clock, LogOut, ClipboardList, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [progressWeight, setProgressWeight] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [progressCompleted, setProgressCompleted] = useState(false);
  const [progressMessage, setProgressMessage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
  const [longPressActive, setLongPressActive] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const sanitizedData = data.aiPlan?.text ? {
            ...data,
            aiPlan: {
              ...data.aiPlan,
              text: sanitizeAIText(data.aiPlan.text)
            }
          } : data;
          setUserData(sanitizedData);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
          setError(errorData.error || `Ошибка сервера: ${response.status}`);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError('Ошибка сети. Проверьте соединение и попробуйте еще раз.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const surveyResponses = React.useMemo(() => {
    if (!userData?.surveyResponses || userData.surveyResponses.length === 0) return [];
    return [...userData.surveyResponses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [userData]);

  const totalSurveys = surveyResponses.length;
  const lastSurveyDate = totalSurveys > 0 ? new Date(surveyResponses[0].date) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('Введите слово DELETE для подтверждения');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setDeleteError('Не удалось получить токен авторизации');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch('/api/auth/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.error || 'Ошибка удаления аккаунта');
        return;
      }
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    } catch (error) {
      console.error('Delete account error:', error);
      setDeleteError('Ошибка сети при удалении аккаунта');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setPlanLoading(true);
    setPlanError(null);
    setProgressMessage(null);

    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok) {
        setPlanError(result.error || 'Ошибка генерации плана');
      } else {
        const cleanedPlan = sanitizeAIText(result.plan || '');
        setUserData((prev) => ({
          ...prev,
          aiPlan: {
            text: cleanedPlan,
            generatedAt: new Date().toISOString()
          }
        }));
      }
    } catch (err) {
      console.error('Generate plan error:', err);
      setPlanError('Ошибка сети при генерации плана');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleAddProgress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setProgressMessage(null);

    const parsedWeight = Number(progressWeight);
    if (!Number.isFinite(parsedWeight)) {
      setProgressMessage('Введите корректный вес в кг');
      return;
    }
    if (parsedWeight < 30 || parsedWeight > 250) {
      setProgressMessage('Вес должен быть от 30 до 250 кг');
      return;
    }

    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weight: parsedWeight,
          workoutCompleted: progressCompleted,
          nutritionNote: progressNote,
          note: progressNote
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setProgressMessage(result.error || 'Ошибка сохранения прогресса');
      } else {
        setUserData((prev) => ({
          ...prev,
          progressLogs: [result.progress, ...(prev.progressLogs || [])]
        }));
        setProgressWeight('');
        setProgressNote('');
        setProgressCompleted(false);
        setProgressMessage('Прогресс успешно сохранён');
      }
    } catch (err) {
      console.error('Save progress error:', err);
      setProgressMessage('Ошибка сети при сохранении прогресса');
    }
  };

  const openFilePicker = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLongPressStart = () => {
    if (uploading) return;

    const timer = setTimeout(() => {
      setLongPressActive(true);
      setIsPreviewOpen(true);
    }, 700); // 700ms long press threshold

    setLongPressTimer(timer);
  };

  const clearLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleAvatarClick = () => {
    if (longPressActive) {
      setLongPressActive(false);
      return;
    }
    openFilePicker();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка размера файла
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой (максимум 5MB)");
      return;
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError("Допускаются только изображения (JPG, PNG, WebP, GIF)");
      return;
    }

    setUploading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, avatar: data.avatar }));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при загрузке аватара');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Ошибка сети. Проверьте соединение и попробуйте еще раз');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container text-center">
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="container text-center">
          <div className="error-message error-message--spaced">
            {error}
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container profile-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-header"
        >
          <div className="profile-header-left">
            <div
              className="profile-avatar-wrapper"
              onClick={handleAvatarClick}
              onMouseDown={handleLongPressStart}
              onMouseUp={clearLongPress}
              onMouseLeave={clearLongPress}
              onTouchStart={handleLongPressStart}
              onTouchEnd={() => {
                clearLongPress();
                if (!longPressActive) openFilePicker();
                setLongPressActive(false);
              }}
              title="Кликните для изменения; долгое нажатие чтобы просмотреть"
            >
              {userData?.avatar ? (
                <img
                  src={userData.avatar.startsWith('http') ? userData.avatar : `${window.location.origin}${userData.avatar}`}
                  alt="Avatar"
                  className="profile-avatar-img"
                />
              ) : (
                <User className="profile-avatar-icon" />
              )}
              {uploading && <div className="uploading-overlay">Загрузка...</div>}
            </div>

            <div className="profile-header-text">
              <h2 className="profile-username">{userData?.username}</h2>
              <p className="profile-status-text">Личный кабинет FitPulse</p>
              <div className="profile-header-badges">
                <span className="profile-badge">Уровень PRO</span>
                <span className="profile-badge">Цель: силовой баланс</span>
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            <button
              type="button"
              className="btn-secondary btn-small delete-account-btn"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteConfirmText('');
                setDeleteError(null);
              }}
            >
              Удалить аккаунт
            </button>
            <button
              onClick={handleLogout}
              className="btn-logout"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>

          <div className="profile-summary-row">
            <div className="summary-pill">
              <span className="summary-label">Опросов</span>
              <strong>{totalSurveys}</strong>
            </div>
            <div className="summary-pill">
              <span className="summary-label">Последний</span>
              <strong>{lastSurveyDate ? lastSurveyDate.toLocaleDateString() : '—'}</strong>
            </div>
            <div className="summary-pill">
              <span className="summary-label">Прогресс</span>
              <strong>{(userData?.progressLogs || []).length} записей</strong>
            </div>
            <div className="summary-pill">
              <span className="summary-label">План</span>
              <strong>{userData?.aiPlan ? 'Готов' : 'Не создан'}</strong>
            </div>
          </div>

          {error && <div className="avatar-error-message">{error}</div>}
        </motion.div>

        {isPreviewOpen && userData?.avatar && (
          <div className="avatar-preview-overlay" onClick={() => setIsPreviewOpen(false)}>
            <div className="avatar-preview-modal" onClick={(event) => event.stopPropagation()}>
              <button className="avatar-preview-close" onClick={() => setIsPreviewOpen(false)}>
                Закрыть
              </button>
              <img
                src={userData.avatar.startsWith('http') ? userData.avatar : `${window.location.origin}${userData.avatar}`}
                alt="Предварительный просмотр аватара"
                className="avatar-preview-image"
              />
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="delete-modal" onClick={(event) => event.stopPropagation()}>
              <h3>Удаление аккаунта</h3>
              <p>Внимание: все данные будут удалены, включая прогресс, планы и ответы на тесты.</p>
              <p>Чтобы подтвердить действие, введите слово <strong>DELETE</strong>.</p>
              <input
                className="survey-input"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Введите DELETE"
              />
              {deleteError && <div className="status-error">{deleteError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={deleteConfirmText.trim() !== 'DELETE' || deleteLoading}
                  onClick={handleDeleteAccount}
                >
                  {deleteLoading ? 'Удаление...' : 'Удалить аккаунт'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="profile-content">
          <div className="plan-section profile-section">
            <div className="section-title-row">
              <h3 className="history-title">Ваш персональный план</h3>
              <button
                onClick={handleGeneratePlan}
                className="btn-secondary btn-small"
                disabled={planLoading}
              >
                {planLoading ? 'Генерируется...' : (userData?.aiPlan ? 'Обновить план' : 'Создать план')}
              </button>
            </div>
            {planError && <div className="status-error">{planError}</div>}
            {userData?.aiPlan?.text ? (
              <div className="plan-panel">
                <div className="plan-meta">
                  <span>Последняя генерация:</span>
                  <strong>{new Date(userData.aiPlan.generatedAt).toLocaleString()}</strong>
                </div>
                <pre className="plan-text">{userData.aiPlan.text}</pre>
              </div>
            ) : (
              <div className="profile-empty-state">
                <ClipboardList className="empty-state-icon" />
                <h3 className="empty-state-title">План ещё не создан</h3>
                <p className="empty-state-description">Создайте персональный план на основе вашего последнего опроса.</p>
              </div>
            )}
          </div>

          <div className="progress-section profile-section">
            <div className="section-title-row">
              <h3 className="history-title">Отслеживание прогресса</h3>
            </div>
            <div className="progress-form">
              <label className="form-label">Вес (кг)</label>
              <input
                className="survey-input"
                type="number"
                min="30"
                max="250"
                value={progressWeight}
                onChange={(e) => setProgressWeight(e.target.value)}
                placeholder="Например, 72"
              />
              <label className="form-label">Комментарий по питанию / тренировке</label>
              <textarea
                className="survey-input"
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Например: сегодня сделал тренировку и съел белковый завтрак"
              />
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={progressCompleted}
                  onChange={(e) => setProgressCompleted(e.target.checked)}
                />
                Тренировка выполнена
              </label>
              <button
                onClick={handleAddProgress}
                className="btn-primary"
              >
                Сохранить прогресс
              </button>
              {progressMessage && <div className="status-note">{progressMessage}</div>}
            </div>

            {(userData?.progressLogs || []).length > 0 ? (
              <div className="progress-list">
                {(userData.progressLogs || []).map((log, index) => (
                  <div key={index} className="progress-item">
                    <div className="progress-date">{new Date(log.date).toLocaleDateString()}</div>
                    <div className="progress-details">
                      {log.weight !== undefined && <span>Вес: {log.weight} кг</span>}
                      <span>Тренировка: {log.workoutCompleted ? 'да' : 'нет'}</span>
                    </div>
                    {log.nutritionNote && <div className="progress-note">{log.nutritionNote}</div>}
                    {log.note && <div className="progress-note">{log.note}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-state">
                <ClipboardList className="empty-state-icon" />
                <h3 className="empty-state-title">Прогресс пока не отслежен</h3>
                <p className="empty-state-description">Фиксируйте результаты, чтобы видеть изменения и улучшения.</p>
              </div>
            )}
          </div>

          <div className="profile-history profile-section">
            <div className="section-title-row">
              <h3 className="history-title">История опросов</h3>
            </div>
            {totalSurveys > 0 ? (
              <div className="history-list">
                {surveyResponses.map((item, index) => (
                  <div key={`${item.surveyId}-${index}`} className="history-item">
                    <div className="history-info">
                      <div className="history-quiz-name">{item.surveyId}</div>
                      <div className="history-date">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="history-score">
                      {item.answers.length} ответов
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-state">
                <ClipboardList className="empty-state-icon" />
                <h3 className="empty-state-title">История опросов пуста</h3>
                <p className="empty-state-description">Пройдите опрос, чтобы начать создание вашей тренировочной системы.</p>
                <button
                  onClick={() => navigate('/tests')}
                  className="btn-primary"
                >
                  Начать опрос
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
