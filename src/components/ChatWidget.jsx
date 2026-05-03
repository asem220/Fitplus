import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const CHAT_HISTORY_KEY = 'fitpulse-ai-chat-history';
const CHAT_POSITION_KEY = 'fitpulse-ai-chat-position';

const isLikelyPlan = (text) => {
  if (!text) return false;
  return [
    /Тренировки/, /Питание/, /Рекомендации/, /Ограничения/
  ].every((pattern) => pattern.test(text));
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ right: 24, bottom: 24 });
  const [dragActive, setDragActive] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, right: 24, bottom: 24 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([{ role: 'assistant', content: 'Привет! Я готов помочь адаптировать ваш тренировочный план.' }]);
        }
      } else {
        setMessages([{ role: 'assistant', content: 'Привет! Я готов помочь адаптировать ваш тренировочный план.' }]);
      }
    } catch {
      setMessages([{ role: 'assistant', content: 'Привет! Я готов помочь адаптировать ваш тренировочный план.' }]);
    }

    try {
      const storedPos = localStorage.getItem(CHAT_POSITION_KEY);
      if (storedPos) {
        const parsed = JSON.parse(storedPos);
        if (parsed && typeof parsed.right === 'number' && typeof parsed.bottom === 'number') {
          setPosition(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  const token = localStorage.getItem('token');
  const isAuthorized = Boolean(token);

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((item) => item.role === 'assistant'),
    [messages]
  );

  const canSavePlan = isLikelyPlan(lastAssistant?.content);

  const addMessage = (message) => setMessages((prev) => [...prev, message]);

  const parseApiResponse = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || `${response.status} ${response.statusText}` };
    }
  };

  const sendMessage = async () => {
    setError(null);
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isAuthorized) {
      setError('Нужно войти, чтобы общаться с ИИ.');
      return;
    }

    const userMessage = { role: 'user', content: trimmed };
    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: trimmed })
      });

      const body = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(body?.error || `Ошибка чата (${response.status})`);
      }

      addMessage({ role: 'assistant', content: body?.reply || 'Похоже, ИИ не ответил. Попробуйте ещё раз.' });
    } catch (err) {
      console.error('Chat widget error:', err);
      setError(err.message || 'Ошибка общения с ИИ');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!canSavePlan || !lastAssistant?.content) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planText: lastAssistant.content })
      });
      const body = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(body?.error || `Ошибка сохранения плана (${response.status})`);
      }
      addMessage({ role: 'assistant', content: 'Этот ответ сохранён как ваш текущий план.' });
    } catch (err) {
      console.error('Save plan error:', err);
      setError(err.message || 'Ошибка сохранения плана');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleDragStart = (event) => {
    if (event.button !== 0) return;
    setDragActive(true);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      right: position.right,
      bottom: position.bottom
    };
    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
  };

  const handleDragMove = (event) => {
    if (!dragActive) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const nextRight = Math.max(12, dragRef.current.right - dx);
    const nextBottom = Math.max(12, dragRef.current.bottom - dy);
    setPosition({ right: nextRight, bottom: nextBottom });
  };

  const handleDragEnd = () => {
    setDragActive(false);
    window.removeEventListener('pointermove', handleDragMove);
    window.removeEventListener('pointerup', handleDragEnd);
  };

  return (
    <div
      className="chat-widget"
      style={{ right: `${position.right}px`, bottom: `${position.bottom}px` }}
    >
      {!open ? (
        <button
          type="button"
          className="chat-button"
          onClick={() => setOpen(true)}
          onPointerDown={handleDragStart}
        >
          <MessageCircle className="chat-button-icon" />
          <span>Чат</span>
        </button>
      ) : (
        <div className="chat-panel">
          <div className="chat-panel-header" onPointerDown={handleDragStart}>
            <div>
              <div className="chat-panel-title">Чат с ИИ</div>
              <div className="chat-panel-subtitle">Попросите адаптировать план или уточнить ограничения</div>
            </div>
            <button type="button" className="chat-close-button" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message chat-message-${message.role}`}
              >
                <div className="chat-message-role">{message.role === 'assistant' ? 'ИИ' : 'Вы'}</div>
                <div className="chat-message-text">{message.content}</div>
              </div>
            ))}
          </div>

          {error && <div className="chat-error">{error}</div>}

          {canSavePlan && (
            <button
              type="button"
              className="chat-save-plan-button"
              onClick={handleSavePlan}
              disabled={loading}
            >
              Сохранить последний ответ как план
            </button>
          )}

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthorized ? 'Опишите, что нужно изменить или какие ограничения у вас есть...' : 'Войдите, чтобы начать чат с ИИ'}
              rows={2}
              disabled={!isAuthorized || loading}
            />
            <button
              type="button"
              className="chat-send-button"
              onClick={sendMessage}
              disabled={!input.trim() || loading || !isAuthorized}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
