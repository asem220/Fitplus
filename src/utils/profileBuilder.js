const normalizeText = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const parseNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = Number(String(value).replace(',', '.').trim());
  return Number.isFinite(normalized) ? normalized : fallback;
};

const splitTextList = (value) => {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return String(value)
    .split(/[;,\n]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
};

const mapGoal = (answer) => {
  const value = normalizeText(answer).toLowerCase();
  if (/похуд|жир|сброс|худ/.test(value)) return 'weight_loss';
  if (/набор|мышц|мышечной/.test(value)) return 'muscle_gain';
  if (/рекомп|композ|компози|компонов|жел[а]ю и жир/.test(value)) return 'recomposition';
  if (/вынослив|кардио/.test(value)) return 'endurance';
  if (/сила|силов|strength/.test(value)) return 'strength';
  return 'recomposition';
};

const mapLevel = (answer) => {
  const value = normalizeText(answer).toLowerCase();
  if (/нович|начин|beginner/.test(value)) return 'beginner';
  if (/средн|интерм|intermediate/.test(value)) return 'intermediate';
  if (/продвинут|advanced|опыт/.test(value)) return 'advanced';
  return 'beginner';
};

const mapActivityLevel = (answer) => {
  const value = normalizeText(answer).toLowerCase();
  if (/сидяч|малоподвиж|низк/.test(value)) return 'low';
  if (/смеш|умеренн|medium|средн/.test(value)) return 'medium';
  if (/актив|подвиж|high|высок/.test(value)) return 'high';
  return 'medium';
};

const parseBoolean = (answer) => {
  const value = normalizeText(answer).toLowerCase();
  if (!value) return false;
  if (/^(да|yes|true|готов|готовы)$/.test(value)) return true;
  return false;
};

const normalizeTrainingPlace = (answer) => {
  const values = splitTextList(answer);
  const mapped = new Set();

  values.forEach((item) => {
    const lower = item.toLowerCase();
    if (/зал|gym|фитнес/.test(lower)) mapped.add('gym');
    if (/дом|home/.test(lower)) mapped.add('home');
    if (/улиц|outdoor|на улице/.test(lower)) mapped.add('outdoor');
    if (/смеш|mix/.test(lower)) {
      mapped.add('gym');
      mapped.add('home');
      mapped.add('outdoor');
    }
  });

  return Array.from(mapped);
};

const normalizeEquipment = (answer) => {
  const values = splitTextList(answer);
  return values.map((item) => item.toLowerCase());
};

const normalizeLimitations = (answers) => {
  const limitations = [];

  ['injuries', 'chronic-conditions', 'contraindications', 'pain-during-movement'].forEach((key) => {
    const value = normalizeText(answers[key]);
    if (value && !/^нет$/i.test(value)) {
      limitations.push(value);
    }
  });

  return limitations;
};

const normalizeFoodList = (answer) => {
  const values = splitTextList(answer);
  return values.map((item) => item.toLowerCase());
};

const normalizeSimpleList = (answer) => {
  if (Array.isArray(answer)) {
    return answer.map((item) => normalizeText(item)).filter(Boolean);
  }
  return splitTextList(answer);
};

export function buildUserProfile(answers = {}) {
  const profile = {
    goal: mapGoal(answers['main-goal']),
    level: mapLevel(answers['current-level']),
    daysPerWeek: parseNumber(answers['days-per-week'], 3),
    trainingPlace: normalizeTrainingPlace(answers['training-place']),
    equipment: normalizeEquipment(answers['equipment']),
    limitations: normalizeLimitations(answers),
    hasInjuries: false,
    sleepHours: parseNumber(answers['sleep-hours'], 7),
    stressLevel: parseNumber(answers['stress-level'], 5),
    activityLevel: mapActivityLevel(answers['work-activity']),
    calorieTracking: parseBoolean(answers['count-calories']),
    cookingReady: parseBoolean(answers['cook-ready']),
    foodPreferences: normalizeFoodList(answers['likes'] || answers['favorite-foods']),
    dislikes: normalizeSimpleList(answers['dislikes']),
  };

  if (profile.daysPerWeek < 1 || profile.daysPerWeek > 7 || Number.isNaN(profile.daysPerWeek)) {
    profile.daysPerWeek = 3;
  }

  if (profile.sleepHours < 4 || profile.sleepHours > 12 || Number.isNaN(profile.sleepHours)) {
    profile.sleepHours = 7;
  }

  if (profile.stressLevel < 1 || profile.stressLevel > 10 || Number.isNaN(profile.stressLevel)) {
    profile.stressLevel = 5;
  }

  if (!profile.trainingPlace.length && answers['training-place']) {
    profile.trainingPlace = normalizeTrainingPlace(answers['training-place']);
  }

  profile.hasInjuries = Boolean(
    normalizeText(answers['injuries']) && !/^нет$/i.test(answers['injuries']) ||
    normalizeText(answers['pain-during-movement']) && !/^нет$/i.test(answers['pain-during-movement'])
  );

  if (!profile.goal) {
    profile.goal = 'recomposition';
  }

  if (!profile.level) {
    profile.level = 'beginner';
  }

  if (!profile.trainingPlace.length) {
    profile.trainingPlace = ['gym'];
  }

  return profile;
}

const prettyList = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 'нет данных';
  return items.join(', ');
};

export function buildPrompt(profile) {
  const lines = [
    'Профиль пользователя для генерации плана:',
    `- Цель: ${profile.goal}`,
    `- Уровень: ${profile.level}`,
    `- Дней тренировок в неделю: ${profile.daysPerWeek}`,
    `- Место тренировок: ${prettyList(profile.trainingPlace)}`,
    `- Оборудование: ${prettyList(profile.equipment)}`,
    `- Ограничения: ${prettyList(profile.limitations)}`,
    `- Есть травмы или боли: ${profile.hasInjuries ? 'да' : 'нет'}`,
    `- Сон: ${profile.sleepHours} часов`,
    `- Уровень стресса: ${profile.stressLevel}`,
    `- Активность: ${profile.activityLevel}`,
    `- Готовность считать калории: ${profile.calorieTracking ? 'да' : 'нет'}`,
    `- Готовность готовить по плану: ${profile.cookingReady ? 'да' : 'нет'}`,
    `- Предпочтения в еде: ${prettyList(profile.foodPreferences)}`,
    `- Что не нравится: ${prettyList(profile.dislikes)}`,
    '',
    'Пожалуйста, сформируй:',
    '- реалистичный недельный план тренировок',
    '- рекомендации по питанию',
    '- без медицинских советов',
    '- с учётом уровня подготовки, доступного оборудования и ограничений',
    '- без необоснованных обещаний',
  ];

  lines.push(
    '- составь недельный график тренировок с указанием количества дней, типа нагрузки и времени восстановления',
    '- предложи рекомендации по питанию, которые подходят под предпочтения и готовность считать калории',
    '- предложи упражнения по уровню подготовки и доступному оборудованию',
    '- определи простые правила, как отслеживать прогресс и избегать травм',
    '- не давай медицинских рекомендаций и не предлагай опасные нагрузки',
    '- сделай план реалистичным, сбалансированным и удобным для регулярного выполнения',
    '- ответ должен быть простым текстом без markdown-форматирования, без символов **, *, |, без таблиц',
    '- используй ровно четыре раздела: Тренировки, Питание, Рекомендации, Ограничения',
    '- каждый раздел должен содержать короткие пункты и быть легко читаемым'
  );

  return lines.join('\n');
}

export function buildChatPrompt(profile, existingPlan, userMessage) {
  const profileLines = [
    'Профиль пользователя для адаптации и корректировки плана:',
    `- Цель: ${profile.goal}`,
    `- Уровень: ${profile.level}`,
    `- Дней тренировок в неделю: ${profile.daysPerWeek}`,
    `- Место тренировок: ${prettyList(profile.trainingPlace)}`,
    `- Оборудование: ${prettyList(profile.equipment)}`,
    `- Ограничения: ${prettyList(profile.limitations)}`,
    `- Есть травмы или боли: ${profile.hasInjuries ? 'да' : 'нет'}`,
    `- Сон: ${profile.sleepHours} часов`,
    `- Уровень стресса: ${profile.stressLevel}`,
    `- Активность: ${profile.activityLevel}`,
    `- Готовность считать калории: ${profile.calorieTracking ? 'да' : 'нет'}`,
    `- Готовность готовить по плану: ${profile.cookingReady ? 'да' : 'нет'}`,
    `- Предпочтения в еде: ${prettyList(profile.foodPreferences)}`,
    `- Что не нравится: ${prettyList(profile.dislikes)}`,
  ];

  const promptLines = [
    ...profileLines,
    '',
    existingPlan ? `Текущий план:
${existingPlan}` : 'Текущий план не задан.',
    '',
    'Пользователь задаёт вопрос или просит адаптацию:',
    userMessage,
    '',
    'Если пользователь просит изменить план, предложи обновлённый план с теми же четырьмя разделами: Тренировки, Питание, Рекомендации, Ограничения. Если речь идёт о совете, ответь просто и понятно.',
    'Всегда отвечай простым текстом, без markdown, без символов **, *, | и без таблиц.',
  ];

  return promptLines.join('\n');
}

// Пример использования:
// const answers = {
//   'main-goal': 'Похудение',
//   'current-level': 'Новичок',
//   'days-per-week': '4',
//   'training-place': ['Зал', 'Дома'],
//   'equipment': 'Гантели, штанга',
//   'injuries': 'Нет',
//   'pain-during-movement': 'Нет',
//   'sleep-hours': '7',
//   'stress-level': '6',
//   'work-activity': 'Смешанная',
//   'count-calories': 'Да',
//   'cook-ready': 'Иногда',
//   'likes': ['Силовые', 'Кардио'],
//   'dislikes': ['Бег']
// };
// const profile = buildUserProfile(answers);
// const prompt = buildPrompt(profile);
// console.log(profile);
// console.log(prompt);
