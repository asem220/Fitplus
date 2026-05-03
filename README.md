# QuizMaster

## Описание проекта

QuizMaster — это SPA (Single Page Application) на React + Node.js (Express), с аутентификацией, хранением данных в MongoDB и поддержкой загрузки аватара пользователя.

Пользователь может:
- зарегистрироваться и войти в систему (JWT);
- пройти тесты, и результаты сохраняются в профиле;
- просматривать историю прохождений;
- загрузить свой аватар и увидеть его в профиле;
- просматривать адаптивный интерфейс для мобильных, планшетов и десктопа.

## Стек технологий

- Frontend: React 19, React Router DOM, motion/react, lucide-react
- Backend: Node.js, Express, MongoDB, Mongoose
- Аутентификация: JWT + bcrypt
- Хранение аватаров: multer + файловая папка `/uploads`
- Стили: CSS (global + components + pages)
- Сборка: Vite

## Структура проекта

- `src/App.jsx` — маршрутизация приложения.
- `src/main.jsx` — монтирование приложения и импорт CSS.
- `src/components/Header.jsx` — меню, навигация, профиль/вход.
- `src/components/Quiz.jsx` — логика тестирования.
- `src/pages` — страницы (Home, Tests, About, ProfilePage, Login, Register, NotFound).
- `src/data/quizzes.js` — данные для тестов.
- `src/styles` — локальные стили.
- `server.js` — Express сервер и API.

## API

### POST `/api/auth/register`
Регистрация аккаунта.
Тело JSON: `{ username, email, password }`.
Возвращает: `{ token, username }`.

### POST `/api/auth/login`
Вход пользователя.
Тело JSON: `{ email, password }`.
Возвращает: `{ token, username }`.

### GET `/api/auth/profile`
Профиль пользователя (JWT required).

### POST `/api/auth/upload-avatar`
Загрузка аватара (JWT required).
Формат: `multipart/form-data` (поле `avatar`).
Ограничения: JPG/PNG/WebP/GIF, до 5MB.
Возвращает: `{ avatar }` (URL). 

### POST `/api/quiz/save`
Сохранение результата теста (JWT required).
Тело JSON: `{ quizId, score, totalQuestions }`.

## Как запустить локально

1. Клонировать репозиторий

```bash
git clone <url>
cd quiz
```

2. Установить зависимости

```bash
npm install
```

3. Создать `.env` файл с переменными:

```text
MONGODB_URI=mongodb://localhost:27017/testify
JWT_SECRET=ваш_секрет
GROQ_API_KEY=ваш_ключ_Groq
# старые варианты (если заданы):
# GEMINI_API_KEY=...
# GOOGLE_API_KEY=...
```

4. Запустить MongoDB (локально)

5. Запустить сервер + клиент

```bash
npm run dev
```

6. Открыть: `http://localhost:3000`

## Особенности

- Сохраняются результаты прохождения в `scores` пользователя:
  - `quizId`, `score`, `totalQuestions`, `date`.
- Профиль отображает историю, средний балл и статус (Мастер/Профи/Студент/Новичок).
- Вход/регистрация защищены валидными сообщениями об ошибках.

## Что ещё доработать

- Деплой на Render (рекомендовано); минимум в production будет `<backend>.onrender.com`.
- Сформировать полный API-документ (Postman Collection).
- Провести тесты в Chrome/Firefox/Safari.
- Подключить линтер (ESLint + Prettier).

---

## Примечание

README заменяет однообразную таблицу критериев; здесь описано все востребованное для защиты курсового проекта.
 
 
 