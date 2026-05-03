export const quizzes = [
  {
    id: 'fitness-survey',
    title: 'Фитнес-опросник',
    description: 'Полный опросник для расчета плана тренировок, питания и реальных ожиданий.',
    icon: 'Dumbbell',
    sections: [
      {
        id: 'basic-data',
        title: 'Базовые данные',
        description: 'Начинаем с самого важного: тело, история веса и измерения.',
        questions: [
          {
            id: 'age',
            question: 'Сколько вам лет?',
            type: 'number',
            placeholder: 'Введите точный возраст'
          },
          {
            id: 'gender',
            question: 'Пол или гендерная идентичность',
            type: 'text',
            placeholder: 'Например: Мужской, Женский, Небинарный'
          },
          {
            id: 'height',
            question: 'Рост (см)',
            type: 'number',
            placeholder: 'Введите точный рост'
          },
          {
            id: 'weight',
            question: 'Вес (кг)',
            type: 'number',
            placeholder: 'Введите точный вес'
          },
          {
            id: 'measurements',
            question: 'Укажите обхваты (талия, бедра, грудь) по желанию',
            type: 'textarea',
            placeholder: 'Например: талия 80, бедра 100, грудь 95'
          },
          {
            id: 'body-photo',
            question: 'Готовы ли вы загрузить фото тела для более точного анализа?',
            type: 'single',
            options: ['Да, это важно', 'Пока нет', 'Нет']
          },
          {
            id: 'body-type',
            question: 'Оценка телосложения',
            type: 'text',
            placeholder: 'Опишите своё телосложение'
          },
          {
            id: 'weight-change',
            question: 'Изменялся ли ваш вес за последние 3–6 месяцев? Как именно?',
            type: 'textarea',
            placeholder: 'Например: похудел на 2 кг, набрал 3 кг, стабилен'
          }
        ]
      },
      {
        id: 'goal',
        title: 'Цель',
        description: 'Самый важный блок: цель, ожидаемые изменения и приоритеты.',
        questions: [
          {
            id: 'main-goal',
            question: 'Какая цель для вас сейчас приоритетнее всего?',
            type: 'single',
            options: ['Похудение', 'Набор мышц', 'Рекомпозиция', 'Выносливость', 'Сила', 'Другое']
          },
          {
            id: 'goal-change',
            question: 'Сколько килограммов вы хотите изменить?',
            type: 'text',
            placeholder: 'Например: -5 кг, +4 кг, хотите держать вес'
          },
          {
            id: 'goal-time',
            question: 'За какой срок вы хотите этого добиться?',
            type: 'text',
            placeholder: 'Например: 3 месяца, 12 недель'
          },
          {
            id: 'goal-priority',
            question: 'Что для вас важнее всего?',
            type: 'single',
            options: ['Внешний вид', 'Сила', 'Здоровье', 'Выносливость', 'Другое']
          },
          {
            id: 'calorie-tracking-ready',
            question: 'Готовы ли вы считать калории, если это потребуется?',
            type: 'single',
            options: ['Да', 'Скорее да', 'Нет']
          },
          {
            id: 'discipline-ready',
            question: 'Готовы ли вы соблюдать режим тренировок и питания?',
            type: 'single',
            options: ['Да', 'Постараюсь', 'Нет']
          }
        ]
      },
      {
        id: 'lifestyle',
        title: 'Образ жизни',
        description: 'Сколько вы двигаетесь, как спите и какие условия вокруг вас.',
        questions: [
          {
            id: 'work-activity',
            question: 'Тип вашей ежедневной активности (работа/учёба)',
            type: 'text',
            placeholder: 'Например: сидячая, активная, смешанная'
          },
          {
            id: 'steps',
            question: 'Среднее количество шагов в день, если знаете',
            type: 'number',
            placeholder: 'Введите количество шагов'
          },
          {
            id: 'sleep-hours',
            question: 'Сколько часов вы обычно спите?',
            type: 'number',
            placeholder: 'Введите количество часов'
          },
          {
            id: 'sleep-routine',
            question: 'Стабильный ли у вас режим сна?',
            type: 'single',
            options: ['Да', 'Частично', 'Нет']
          },
          {
            id: 'stress-level',
            question: 'Уровень стресса по шкале 1–10',
            type: 'number',
            placeholder: 'Введите число от 1 до 10',
            min: 1,
            max: 10
          },
          {
            id: 'habits',
            question: 'Опишите вредные привычки, если они есть',
            type: 'textarea',
            placeholder: 'Например: курение, алкоголь, переедание'
          }
        ]
      },
      {
        id: 'experience',
        title: 'Опыт тренировок',
        description: 'Что вы уже пробовали, что работало, а что нет.',
        questions: [
          {
            id: 'trained-before',
            question: 'Был ли у вас опыт тренировок раньше? Если да, сколько времени?',
            type: 'text',
            placeholder: 'Например: нет, 6 месяцев, год'
          },
          {
            id: 'training-type',
            question: 'Какие типы тренировок вы пробовали или предпочитаете?',
            type: 'multi',
            options: ['Зал', 'Дома', 'Кардио', 'Смешанные']
          },
          {
            id: 'current-level',
            question: 'Как вы оцениваете свой уровень сейчас?',
            type: 'single',
            options: ['Новичок', 'Средний', 'Продвинутый', 'Другое']
          },
          {
            id: 'what-worked',
            question: 'Что в прошлых тренировках работало лучше всего?',
            type: 'textarea',
            placeholder: 'Укажите, что помогало'
          },
          {
            id: 'why-stopped',
            question: 'Почему вы бросали занятия раньше?',
            type: 'textarea',
            placeholder: 'Опишите причины'
          }
        ]
      },
      {
        id: 'limitations',
        title: 'Ограничения',
        description: 'Важно понять травмы, болезни и боль, чтобы не навредить.',
        questions: [
          {
            id: 'injuries',
            question: 'Есть ли травмы или боль? Если да, где именно?',
            type: 'textarea',
            placeholder: 'Например: спина, колени, плечи'
          },
          {
            id: 'chronic-conditions',
            question: 'Есть ли хронические заболевания? Если да, какие?',
            type: 'textarea',
            placeholder: 'Перечислите заболевания'
          },
          {
            id: 'contraindications',
            question: 'Есть ли противопоказания к нагрузкам?',
            type: 'textarea',
            placeholder: 'Опишите, если есть'
          },
          {
            id: 'pain-during-movement',
            question: 'Болит ли что-то при движении? Где именно?',
            type: 'textarea',
            placeholder: 'Укажите область боли'
          }
        ]
      },
      {
        id: 'resources',
        title: 'Доступные ресурсы',
        description: 'Где вы тренируетесь, какое оборудование есть и сколько времени.',
        questions: [
          {
            id: 'training-place',
            question: 'Где вы будете тренироваться?',
            type: 'multi',
            options: ['Зал', 'Дома', 'На улице', 'Смешанный']
          },
          {
            id: 'equipment',
            question: 'Какое оборудование у вас есть?',
            type: 'textarea',
            placeholder: 'Например: гантели, штанга, тренажёр, скамья'
          },
          {
            id: 'workout-time',
            question: 'Сколько времени вы готовы тратить на тренировку?',
            type: 'text',
            placeholder: 'Например: 30 минут, 60 минут'
          },
          {
            id: 'days-per-week',
            question: 'Сколько дней в неделю вы реально готовы тренироваться?',
            type: 'number',
            placeholder: 'Введите количество дней'
          }
        ]
      },
      {
        id: 'nutrition',
        title: 'Питание',
        description: 'Честные ответы о питании важнее, чем идеальные планы.',
        questions: [
          {
            id: 'eating-pattern',
            question: 'Как вы питаётесь сейчас?',
            type: 'textarea',
            placeholder: 'Опишите режим питания'
          },
          {
            id: 'portion-control',
            question: 'Есть ли переедание или недоедание?',
            type: 'textarea',
            placeholder: 'Опишите, что бывает чаще'
          },
          {
            id: 'favorite-foods',
            question: 'Какие продукты вы любите?',
            type: 'textarea',
            placeholder: 'Например: мясо, овощи, сладкое'
          },
          {
            id: 'intolerances',
            question: 'Есть ли непереносимость или сильные неприязни?',
            type: 'textarea',
            placeholder: 'Укажите продукты или группы'
          },
          {
            id: 'food-budget',
            question: 'Бюджет на питание',
            type: 'single',
            options: ['Низкий', 'Средний', 'Высокий', 'Не уверен']
          },
          {
            id: 'cook-ready',
            question: 'Готовы ли вы готовить блюда по плану?',
            type: 'single',
            options: ['Да', 'Иногда', 'Нет']
          },
          {
            id: 'count-calories',
            question: 'Готовы ли вы считать калории?',
            type: 'single',
            options: ['Да', 'Скорее да', 'Нет']
          },
          {
            id: 'fast-food-frequency',
            question: 'Как часто вы едите сладкое или фастфуд?',
            type: 'single',
            options: ['Редко', '1-2 раза в неделю', 'Несколько раз в неделю', 'Каждый день']
          }
        ]
      },
      {
        id: 'psychology',
        title: 'Психология и поведение',
        description: 'Отвечаем на вопросы, которые часто определяют успех.',
        questions: [
          {
            id: 'real-motivation',
            question: 'Почему вы реально хотите изменить тело?',
            type: 'textarea',
            placeholder: 'Напишите честно'
          },
          {
            id: 'previous-blockers',
            question: 'Что мешало раньше?',
            type: 'textarea',
            placeholder: 'Опишите препятствия'
          },
          {
            id: 'weakest-point',
            question: 'Самая слабая точка',
            type: 'single',
            options: ['Лень', 'Дисциплина', 'Еда', 'Мотивация', 'Другое']
          },
          {
            id: 'strict-vs-flexible',
            question: 'Как вы относитесь к строгому режиму?',
            type: 'single',
            options: ['Готов', 'Предпочитаю гибкий', 'Тяжело выдержать', 'Зависит от результата']
          },
          {
            id: 'plan-preference',
            question: 'Что вам удобнее?',
            type: 'single',
            options: ['Четкий план', 'Свобода', 'Гибрид', 'Не уверен']
          }
        ]
      },
      {
        id: 'preferences',
        title: 'Предпочтения в тренировках',
        description: 'Учитываем, что вам нравится и что вы точно не хотите делать.',
        questions: [
          {
            id: 'likes',
            question: 'Что вам нравится больше всего?',
            type: 'multi',
            options: ['Силовые', 'Кардио', 'Групповые', 'Домашние']
          },
          {
            id: 'dislikes',
            question: 'Что вам нравится меньше всего?',
            type: 'multi',
            options: ['Силовые', 'Кардио', 'Групповые', 'Домашние']
          },
          {
            id: 'exercise-avoid',
            question: 'Есть упражнения, которые вы точно не хотите делать? Если да, какие?',
            type: 'textarea',
            placeholder: 'Напишите, чего не хотите'
          }
        ]
      },
      {
        id: 'expectations',
        title: 'Ожидания',
        description: 'Здесь вскрывается адекватность ожиданий.',
        questions: [
          {
            id: 'expect-1-month',
            question: 'Чего вы ожидаете через 1 месяц?',
            type: 'textarea',
            placeholder: 'Опишите ваши ожидания'
          },
          {
            id: 'expect-3-month',
            question: 'Чего вы ожидаете через 3 месяца?',
            type: 'textarea',
            placeholder: 'Опишите ваши ожидания'
          },
          {
            id: 'expect-6-month',
            question: 'Чего вы ожидаете через 6 месяцев?',
            type: 'textarea',
            placeholder: 'Опишите ваши ожидания'
          }
        ]
      },
      {
        id: 'tracking',
        title: 'Контроль и обратная связь',
        description: 'Как вы будете отслеживать прогресс и вести записи.',
        questions: [
          {
            id: 'progress-tracking',
            question: 'Как вы будете отслеживать прогресс?',
            type: 'multi',
            options: ['Вес', 'Фото', 'Замеры', 'Комбинация']
          },
          {
            id: 'food-journal',
            question: 'Готовы ли вы вести дневник питания?',
            type: 'single',
            options: ['Да', 'Иногда', 'Нет']
          },
          {
            id: 'training-log',
            question: 'Готовы ли вы фиксировать тренировки?',
            type: 'single',
            options: ['Да', 'Иногда', 'Нет']
          }
        ]
      }
    ]
  }
];
