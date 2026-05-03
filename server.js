import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { quizzes } from "./src/data/quizzes.js";
import { buildUserProfile, buildPrompt, buildChatPrompt } from "./src/utils/profileBuilder.js";

dotenv.config();
console.log('ENV FILE CHECK:', process.env);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Допускаются только изображения (JPG, PNG, WebP, GIF)'));
  }
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/testify";
const JWT_SECRET = process.env.JWT_SECRET || "asem2026";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('Warning: GROQ_API_KEY not set in environment variables. AI plan generation will not work.');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const progressLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  weight: Number,
  workoutCompleted: Boolean,
  nutritionNote: String,
  note: String
}, { _id: false });

const surveyResponseSchema = new mongoose.Schema({
  surveyId: String,
  answers: [mongoose.Schema.Types.Mixed],
  answersMap: mongoose.Schema.Types.Mixed,
  totalQuestions: Number,
  date: { type: Date, default: Date.now }
}, { _id: false });

const aiPlanSchema = new mongoose.Schema({
  text: String,
  generatedAt: Date,
  sourceSurveyId: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  surveyResponses: [surveyResponseSchema],
  scores: [{ 
    quizId: String, 
    score: Number, 
    totalQuestions: Number,
    date: { type: Date, default: Date.now } 
  }],
  aiPlan: aiPlanSchema,
  progressLogs: [progressLogSchema]
});

const User = mongoose.model("User", userSchema);

const mapAnswersArrayToById = (quizId, answersArray) => {
  const quiz = quizzes.find((item) => item.id === quizId);
  if (!quiz || !Array.isArray(answersArray)) return null;
  const questionList = quiz.sections.flatMap((section) => section.questions);
  if (questionList.length !== answersArray.length) return null;
  return Object.fromEntries(questionList.map((question, idx) => [question.id, answersArray[idx]]));
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const sanitizeAIPlanText = (text) => {
  if (!text) return '';
  let cleaned = String(text).replace(/\r\n|\r/g, '\n');
  cleaned = cleaned.replace(/^\s*#{1,6}\s*/gm, '');
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*/g, '');
  cleaned = cleaned.replace(/\|/g, '');
  cleaned = cleaned.split('\n').map((line) => line.trim()).join('\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
};

// Эндпоинт регистрации
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Все поля обязательны для заполнения" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Пожалуйста, введите корректный email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, username: user.username });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: `${field === 'email' ? 'Email' : 'Username'} уже зарегистрирован` });
    } else {
      res.status(400).json({ error: "Ошибка регистрации. Попробуйте еще раз" });
    }
  }
});

// Эндпоинт входа
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, username: user.username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Ошибка при входе в систему" });
  }
});

// Эндпоинт получения профиля
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении данных профиля" });
  }
});

// Эндпоинт удаления аккаунта
app.delete("/api/auth/delete", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await User.deleteOne({ _id: userId });
    return res.json({ message: "Аккаунт успешно удалён" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ error: "Ошибка удаления аккаунта" });
  }
});

// Эндпоинт генерации персонального плана через ИИ
app.post("/api/ai/plan", authenticateToken, async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "Не настроен ключ GROQ_API_KEY" });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    let answersMap = null;
    const { answers } = req.body;

    if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
      answersMap = answers;
    } else {
      const latestResponse = [...user.surveyResponses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      if (!latestResponse) {
        return res.status(400).json({ error: "Нет сохранённых ответов для генерации плана" });
      }
      answersMap = latestResponse.answersMap || mapAnswersArrayToById(latestResponse.surveyId, latestResponse.answers);
    }

    if (!answersMap || typeof answersMap !== 'object') {
      return res.status(400).json({ error: "Не удалось сопоставить ответы опроса для генерации" });
    }

    const profile = buildUserProfile(answersMap);
    const prompt = buildPrompt(profile);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Ты опытный фитнес-тренер и нутрициолог. Твоя задача: подготовить простой текстовый план на основе данных пользователя. Ответ должен быть полностью структурированным, без markdown. Не используй символы **, *, |. Не используй таблицы. Выходные секции должны быть ровно такими заголовками: Тренировки, Питание, Рекомендации, Ограничения. Для каждого раздела приводи короткие пункты, без вложенных списков и без лишнего оформления.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2048,
        top_p: 0.95
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Groq API error:', result);
      return res.status(500).json({ error: 'Ошибка генерации плана через Groq' });
    }

    const planText = result.choices?.[0]?.message?.content?.trim();
    if (!planText) {
      console.error('Groq response missing content:', result);
      return res.status(500).json({ error: 'Не удалось получить текст от Groq' });
    }

    const cleanedPlanText = sanitizeAIPlanText(planText);

    user.aiPlan = {
      text: cleanedPlanText,
      generatedAt: new Date(),
      sourceSurveyId: user.surveyResponses.length > 0 ? user.surveyResponses[user.surveyResponses.length - 1].surveyId : undefined
    };
    await user.save();

    return res.status(200).json({ plan: planText });
  } catch (error) {
    console.error('AI plan generation error:', error);
    return res.status(500).json({ error: 'Ошибка генерации плана. Попробуйте позже.' });
  }
});

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Не настроен ключ GROQ_API_KEY' });
  }

  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const latestResponse = [...user.surveyResponses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const answersMap = latestResponse?.answersMap || (latestResponse ? mapAnswersArrayToById(latestResponse.surveyId, latestResponse.answers) : null) || {};
    const profile = buildUserProfile(answersMap);
    const existingPlan = user.aiPlan?.text ? sanitizeAIPlanText(user.aiPlan.text) : '';
    const prompt = buildChatPrompt(profile, existingPlan, message);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'Ты опытный фитнес-тренер и нутрициолог. Отвечай понятно и помогай адаптировать план под ограничения пользователя. Не используй markdown, **, *, | и таблицы.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 2048,
        top_p: 0.95
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Groq chat API error:', result);
      return res.status(500).json({ error: 'Ошибка общения с ИИ' });
    }

    const replyText = result.choices?.[0]?.message?.content?.trim();
    if (!replyText) {
      console.error('Groq chat response missing content:', result);
      return res.status(500).json({ error: 'Не удалось получить ответ от ИИ' });
    }

    return res.status(200).json({ reply: sanitizeAIPlanText(replyText) });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: 'Ошибка чата с ИИ. Попробуйте позже.' });
  }
});

app.post('/api/ai/save-plan', authenticateToken, async (req, res) => {
  try {
    const { planText } = req.body;
    if (!planText || typeof planText !== 'string' || !planText.trim()) {
      return res.status(400).json({ error: 'Текст плана не может быть пустым' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    user.aiPlan = {
      text: sanitizeAIPlanText(planText),
      generatedAt: new Date(),
      sourceSurveyId: user.aiPlan?.sourceSurveyId
    };
    await user.save();

    return res.status(200).json({ message: 'План успешно сохранён' });
  } catch (error) {
    console.error('Save AI plan error:', error);
    return res.status(500).json({ error: 'Ошибка сохранения плана' });
  }
});

app.post('/api/user/progress', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const { weight, workoutCompleted, nutritionNote, note } = req.body;
    const parsedWeight = Number(weight);
    if (!Number.isFinite(parsedWeight)) {
      return res.status(400).json({ error: 'Введите корректный вес в кг' });
    }
    if (parsedWeight < 30 || parsedWeight > 250) {
      return res.status(400).json({ error: 'Вес должен быть в диапазоне от 30 до 250 кг' });
    }

    const progressEntry = {
      date: new Date(),
      weight: parsedWeight,
      workoutCompleted: Boolean(workoutCompleted),
      nutritionNote: typeof nutritionNote === 'string' ? nutritionNote.trim() : undefined,
      note: typeof note === 'string' ? note.trim() : undefined
    };

    user.progressLogs = [progressEntry, ...(user.progressLogs || [])].slice(0, 20);
    await user.save();

    return res.status(201).json({ progress: progressEntry });
  } catch (error) {
    console.error('Progress log error:', error);
    return res.status(500).json({ error: 'Ошибка сохранения прогресса' });
  }
});

// Эндпоинт загрузки аватара
app.post("/api/auth/upload-avatar", authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`;
      const avatarUrl = `${req.protocol}://${req.get('host')}${avatarPath}`;
      user.avatar = avatarUrl;
      await user.save();
      res.json({ message: "Аватар успешно загружен", avatar: avatarUrl });
    } else {
      res.status(400).json({ error: "Файл не найден" });
    }
  } catch (error) {
    console.error("Upload avatar error:", error);
    if (error.message.includes('Допускаются только')) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes('File too large')) {
      res.status(400).json({ error: "Размер файла не должен превышать 5MB" });
    } else {
      res.status(500).json({ error: "Ошибка при загрузке аватара" });
    }
  }
});

// Эндпоинт сохранения результатов
app.post("/api/quiz/save", authenticateToken, async (req, res) => {
  try {
    const { quizId, answers, totalQuestions } = req.body;
    if (!quizId || !Array.isArray(answers) || totalQuestions === undefined) {
      return res.status(400).json({ error: "Некорректные данные опроса" });
    }
    const parsedTotal = Number(totalQuestions);
    if (Number.isNaN(parsedTotal) || parsedTotal <= 0 || answers.length !== parsedTotal) {
      return res.status(400).json({ error: "Некорректные числовые значения или длина ответов" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const answersMap = mapAnswersArrayToById(quizId, answers);
    const existing = user.surveyResponses.find((item) => item.surveyId === quizId);
    if (existing) {
      existing.answers = answers;
      existing.answersMap = answersMap;
      existing.totalQuestions = parsedTotal;
      existing.date = new Date();
    } else {
      user.surveyResponses.push({
        surveyId: quizId,
        answers,
        answersMap,
        totalQuestions: parsedTotal,
        date: new Date()
      });
    }
    await user.save();
    return res.status(200).json({ message: "Опрос успешно сохранен" });
  } catch (error) {
    console.error("Save result error:", error);
    res.status(500).json({ error: "Ошибка при сохранении результата" });
  }
});

// ИЗМЕНЕНИЕ 3: Исправлен запуск для продакшена (Render)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // В продакшене отдаем статику из dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const tryListen = (port) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, "0.0.0.0", () => resolve(server));
      server.on("error", reject);
    });
  };

  let currentPort = Number(PORT) || 3000;
  while (true) {
    try {
      await tryListen(currentPort);
      console.log(`Server running on port ${currentPort}`);
      break;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${currentPort} is already in use, trying ${currentPort + 1}`);
        currentPort += 1;
        continue;
      }
      throw error;
    }
  }
}

startServer();