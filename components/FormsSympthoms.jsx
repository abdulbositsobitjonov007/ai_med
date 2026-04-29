import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    App,
    Button,
    Card,
    Col,
    ConfigProvider,
    Divider,
    Empty,
    Form,
    Input,
    InputNumber,
    Radio,
    Row,
    Segmented,
    Slider,
    Space,
    Spin,
    Tag,
    Typography,
} from 'antd';
import { CheckCircleOutlined, HeartOutlined, HistoryOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HISTORY_STORAGE_KEY = 'pediatric_form_history';
const LANGUAGE_STORAGE_KEY = 'pediatric_form_language';
const OTHER_VALUE = '__other__';
const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : '')
).replace(/\/$/, '');
const ANALYZE_ENDPOINT = API_BASE_URL ? `${API_BASE_URL}/analyze` : '/analyze';

const LANGUAGES = [
    { value: 'uz', label: "O'zbek" },
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
];

const YES_NO = {
    yes: { uz: 'Ha', ru: 'Да', en: 'Yes' },
    no: { uz: "Yo'q", ru: 'Нет', en: 'No' },
    other: { uz: 'Boshqa', ru: 'Другое', en: 'Other' },
};

const copy = {
    uz: {
        appTag: 'Bolalar monitoringi',
        title: "Kasallik turini tanlang va formani to'ldiring",
        subtitle:
            "Har bir yo'nalish bolalar uchun moslashtirilgan. Yuborilgandan keyin AI holat, xavf darajasi va tavsiyani qaytaradi.",
        language: 'Til',
        pickerLabel: 'Yo‘nalishlar',
        historyTitle: "So'nggi so'rovlar",
        historyEmpty: "Hali saqlangan so'rovlar yo'q.",
        clearHistory: 'Tarixni tozalash',
        restore: 'Ochish',
        important: 'Muhim eslatma',
        importantBody:
            "Bu forma shifokor o'rnini bosmaydi. Nafas yetishmasligi, hushdan ketish yoki kuchli og'riq bo'lsa zudlik bilan tibbiy yordamga murojaat qiling.",
        selectedTag: 'Tanlangan forma',
        selectedHint:
            "Savollarga iloji boricha aniq javob bering. Natija yuborilgandan keyin shu oynada ko'rinadi.",
        clearForm: 'Tozalash',
        submit: 'Tahlil qilish',
        analyzing: 'AI javoblarni tahlil qilmoqda...',
        resultTitle: 'Holat bahosi',
        recommendation: 'Tavsiya',
        stable: 'Barqaror',
        watch: 'Ehtiyotkor kuzatuv',
        urgent: "Shoshilinch e'tibor",
        review: 'Tekshiruv kerak',
        fieldRequired: "Bu maydonni to'ldiring",
        optionRequired: 'Variantni tanlang',
        moodRequired: 'Bahoni tanlang',
        otherRequired: 'Boshqa javobni yozing',
        textPlaceholder: 'Javobni kiriting',
        areaPlaceholder: 'Javobni yozing',
        numberPlaceholder: 'Qiymatni kiriting',
        analyzeSuccess: "Tahlil tayyor bo'ldi.",
        analyzeFallback: "Server ulanmaganligi sabab lokal baho ko'rsatildi.",
        autoFallbackPrefix: 'Lokal baho ishlatildi',
        patientLabel: 'Bemor',
        patientChild: 'bola',
        noAnswer: 'Javob berilmagan',
        promptCondition: "Kasallik yo'nalishi",
        promptInstruction:
            "Quyidagi anketa javoblariga asoslanib klinik holatni ehtiyotkor va professional usulda baholang.",
        promptFormat:
            "Javobda 3 bo'limni aniq bering: condition, status, recommendation. Status rangini GREEN, YELLOW yoki RED dan biri sifatida tanlang.",
        promptUrgent:
            "Agar xavfli belgilar bo'lsa, zudlik bilan shifokor yoki tez yordamga murojaat qilishni tavsiya qiling.",
        respondIn: "Javobni o'zbek tilida yozing.",
    },
    ru: {
        appTag: 'Мониторинг детей',
        title: 'Выберите направление и заполните форму',
        subtitle:
            'Каждая анкета адаптирована для детей. После отправки AI вернет состояние, уровень риска и рекомендации.',
        language: 'Язык',
        pickerLabel: 'Направления',
        historyTitle: 'История запросов',
        historyEmpty: 'Пока нет сохраненных запросов.',
        clearHistory: 'Очистить историю',
        restore: 'Открыть',
        important: 'Важное примечание',
        importantBody:
            'Эта форма не заменяет врача. При нехватке воздуха, потере сознания или сильной боли срочно обратитесь за медицинской помощью.',
        selectedTag: 'Выбранная форма',
        selectedHint:
            'Отвечайте как можно точнее. После отправки результат появится в этом же окне.',
        clearForm: 'Очистить',
        submit: 'Анализировать',
        analyzing: 'AI анализирует ответы...',
        resultTitle: 'Оценка состояния',
        recommendation: 'Рекомендация',
        stable: 'Стабильно',
        watch: 'Нужно наблюдение',
        urgent: 'Срочное внимание',
        review: 'Нужна проверка',
        fieldRequired: 'Заполните это поле',
        optionRequired: 'Выберите вариант',
        moodRequired: 'Выберите оценку',
        otherRequired: 'Введите другой ответ',
        textPlaceholder: 'Введите ответ',
        areaPlaceholder: 'Напишите ответ',
        numberPlaceholder: 'Введите значение',
        analyzeSuccess: 'Анализ готов.',
        analyzeFallback: 'Сервер недоступен, поэтому показана локальная оценка.',
        autoFallbackPrefix: 'Использована локальная оценка',
        patientLabel: 'Пациент',
        patientChild: 'ребенок',
        noAnswer: 'Ответ не указан',
        promptCondition: 'Направление',
        promptInstruction:
            'Оцените состояние ребенка осторожно и профессионально на основе ответов анкеты ниже.',
        promptFormat:
            'В ответе обязательно дайте 3 раздела: condition, status, recommendation. Для статуса используйте один из цветов GREEN, YELLOW или RED.',
        promptUrgent:
            'Если есть опасные признаки, обязательно рекомендуйте срочно обратиться к врачу или в скорую помощь.',
        respondIn: 'Напишите ответ на русском языке.',
    },
    en: {
        appTag: 'Pediatric Monitoring',
        title: 'Choose a condition and complete the form',
        subtitle:
            'Each flow is adapted for children. After submission the AI returns condition, risk level, and recommendations.',
        language: 'Language',
        pickerLabel: 'Conditions',
        historyTitle: 'Request history',
        historyEmpty: 'No saved requests yet.',
        clearHistory: 'Clear history',
        restore: 'Open',
        important: 'Important note',
        importantBody:
            'This form does not replace a doctor. If there is shortness of breath, fainting, or severe pain, seek urgent medical help immediately.',
        selectedTag: 'Selected form',
        selectedHint:
            'Please answer as accurately as possible. The result will appear in this panel after submission.',
        clearForm: 'Clear form',
        submit: 'Analyze',
        analyzing: 'AI is analyzing the responses...',
        resultTitle: 'Condition summary',
        recommendation: 'Recommendation',
        stable: 'Stable',
        watch: 'Needs monitoring',
        urgent: 'Urgent attention',
        review: 'Needs review',
        fieldRequired: 'Fill in this field',
        optionRequired: 'Select an option',
        moodRequired: 'Choose a score',
        otherRequired: 'Enter the other answer',
        textPlaceholder: 'Enter the answer',
        areaPlaceholder: 'Write the answer',
        numberPlaceholder: 'Enter the value',
        analyzeSuccess: 'Analysis is ready.',
        analyzeFallback: 'The server was unavailable, so a local assessment was shown.',
        autoFallbackPrefix: 'Local assessment used',
        patientLabel: 'Patient',
        patientChild: 'child',
        noAnswer: 'No answer provided',
        promptCondition: 'Condition',
        promptInstruction:
            'Assess the child carefully and professionally based on the questionnaire answers below.',
        promptFormat:
            'In the answer, provide exactly 3 sections: condition, status, recommendation. Use one of GREEN, YELLOW, or RED for the status color.',
        promptUrgent:
            'If there are danger signs, explicitly recommend urgent contact with a doctor or emergency care.',
        respondIn: 'Write the answer in English.',
    },
};

const makeOption = (value, label) => ({ value, label });

const conditions = [
    {
        key: 'diabetes',
        icon: <MedicineBoxOutlined />,
        accent: '#1677ff',
        title: { uz: 'Qandli diabet', ru: 'Сахарный диабет', en: 'Diabetes mellitus' },
        description: {
            uz: "Glyukoza, insulin, ovqatlanish va umumiy holat nazorati.",
            ru: 'Контроль глюкозы, инсулина, питания и общего состояния.',
            en: 'Tracks glucose, insulin, meals, and overall well-being.',
        },
        intro: {
            uz: "Ushbu forma bolalarda qandli diabet bo'yicha kunlik kuzatuv uchun mo'ljallangan.",
            ru: 'Эта форма предназначена для ежедневного наблюдения за детьми с сахарным диабетом.',
            en: 'This form is designed for daily monitoring of children with diabetes.',
        },
        questions: [
            {
                name: 'fullName',
                type: 'text',
                required: true,
                label: {
                    uz: '1. Ismi va familiyasi:',
                    ru: '1. Имя и фамилия ребенка:',
                    en: '1. Child full name:',
                },
            },
            {
                name: 'age',
                type: 'number',
                required: true,
                min: 0,
                max: 18,
                label: { uz: '2. Yoshi:', ru: '2. Возраст:', en: '2. Age:' },
            },
            {
                name: 'glucose',
                type: 'text',
                required: true,
                label: {
                    uz: '3. Bugun ertalabki qon shakar (glyukoza) darajasi qancha edi?',
                    ru: '3. Какой был утренний уровень сахара (глюкозы) сегодня?',
                    en: '3. What was the child’s morning blood sugar (glucose) level today?',
                },
            },
            {
                name: 'medicationTaken',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "4. Bugun insulin yoki boshqa dorilarni o'z vaqtida qabul qildingizmi?",
                    ru: '4. Были ли сегодня инсулин или другие лекарства приняты вовремя?',
                    en: '4. Were insulin or other medicines taken on time today?',
                },
                options: [
                    makeOption('yes', YES_NO.yes),
                    makeOption('no', YES_NO.no),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'breakfast',
                type: 'textarea',
                required: true,
                label: {
                    uz: '5.1 Bugun nima yedingiz (nonushta)?',
                    ru: '5.1 Что ребенок ел сегодня на завтрак?',
                    en: '5.1 What did the child eat for breakfast today?',
                },
            },
            {
                name: 'lunch',
                type: 'textarea',
                required: true,
                label: {
                    uz: '5.2 Bugun nima yedingiz (tushlik)?',
                    ru: '5.2 Что ребенок ел сегодня на обед?',
                    en: '5.2 What did the child eat for lunch today?',
                },
            },
            {
                name: 'dinner',
                type: 'textarea',
                required: true,
                label: {
                    uz: "5.3 Bugun nima yedingiz (kechki ovqat)?",
                    ru: '5.3 Что ребенок ел сегодня на ужин?',
                    en: '5.3 What did the child eat for dinner today?',
                },
            },
            {
                name: 'sweets',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "6. Shirinlik yoki gazli ichimlik iste'mol qildingizmi?",
                    ru: '6. Употреблял ли ребенок сладости или газированные напитки?',
                    en: '6. Did the child consume sweets or carbonated drinks?',
                },
                options: [
                    makeOption('yes', YES_NO.yes),
                    makeOption('no', YES_NO.no),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'urination',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "7. Tez-tez siyish yoki ko'p suyuqlik ichish holati bo'ldimi?",
                    ru: '7. Были ли частое мочеиспускание или сильная жажда?',
                    en: '7. Was there frequent urination or increased thirst today?',
                },
                options: [
                    makeOption('yes', YES_NO.yes),
                    makeOption('no', YES_NO.no),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'feeling',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "8. Bugun o'zingizni qanday his qildingiz?",
                    ru: '8. Как ребенок чувствовал себя сегодня?',
                    en: '8. How did the child feel today?',
                },
                options: [
                    makeOption('good', { uz: 'Yaxshi', ru: 'Хорошо', en: 'Good' }),
                    makeOption('tired', { uz: 'Charchagan', ru: 'Усталость', en: 'Tired' }),
                    makeOption('bad', { uz: 'Yomon', ru: 'Плохо', en: 'Bad' }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'activity',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "9. Bugun jismoniy faollik bo'ldimi? (sport, yurish, o'yinlar)",
                    ru: '9. Была ли сегодня физическая активность? (спорт, прогулка, игры)',
                    en: '9. Was there physical activity today? (sports, walking, games)',
                },
                options: [
                    makeOption('yes', YES_NO.yes),
                    makeOption('no', YES_NO.no),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'mood',
                type: 'slider',
                required: true,
                min: 0,
                max: 10,
                label: {
                    uz: '10. Ruhiy holatingizni baholang (0-10):',
                    ru: '10. Оцените эмоциональное состояние (0-10):',
                    en: '10. Rate emotional well-being (0-10):',
                },
                marks: {
                    uz: { 0: 'Juda yomon', 5: '5', 10: 'Juda yaxshi' },
                    ru: { 0: 'Очень плохо', 5: '5', 10: 'Очень хорошо' },
                    en: { 0: 'Very poor', 5: '5', 10: 'Very good' },
                },
            },
            {
                name: 'notes',
                type: 'textarea',
                label: {
                    uz: "11. Qo'shimcha izohlar:",
                    ru: '11. Дополнительные комментарии:',
                    en: '11. Additional notes:',
                },
            },
        ],
    },
    {
        key: 'asthma',
        icon: <HeartOutlined />,
        accent: '#13c2c2',
        title: { uz: 'Bronxial astma', ru: 'Бронхиальная астма', en: 'Bronchial asthma' },
        description: {
            uz: "Yo'tal, nafas qisishi, ingalyator va qo'zg'atuvchi omillar.",
            ru: 'Кашель, одышка, ингалятор и провоцирующие факторы.',
            en: 'Tracks cough, shortness of breath, inhaler use, and triggers.',
        },
        intro: {
            uz: "Ushbu forma bronxial astma bilan yashovchi bolalarning kunlik nafas holatini baholaydi.",
            ru: 'Эта форма оценивает ежедневное дыхательное состояние детей с бронхиальной астмой.',
            en: 'This form evaluates the child’s daily respiratory status with bronchial asthma.',
        },
        questions: [
            {
                name: 'fullName',
                type: 'text',
                required: true,
                label: {
                    uz: '1. Bolaning ismi va familiyasi:',
                    ru: '1. Имя и фамилия ребенка:',
                    en: '1. Child full name:',
                },
            },
            {
                name: 'age',
                type: 'number',
                required: true,
                min: 0,
                max: 18,
                label: { uz: '2. Yoshi:', ru: '2. Возраст:', en: '2. Age:' },
            },
            {
                name: 'phone',
                type: 'text',
                required: true,
                label: {
                    uz: '3. Telefon raqami (ota yoki ona):',
                    ru: '3. Телефон родителя:',
                    en: '3. Parent phone number:',
                },
            },
            {
                name: 'nightCough',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "4. Tunda qancha marta yo'tal kuzatildi?",
                    ru: '4. Сколько раз ночью наблюдался кашель?',
                    en: '4. How many times did coughing occur at night?',
                },
                options: [
                    makeOption('none', { uz: "Yo'q", ru: 'Не было', en: 'None' }),
                    makeOption('once', { uz: '1 marta', ru: '1 раз', en: '1 time' }),
                    makeOption('twoThree', { uz: '2-3 marta', ru: '2-3 раза', en: '2-3 times' }),
                    makeOption('many', {
                        uz: "3 martadan ko'p (uxlolmadim)",
                        ru: 'Более 3 раз (не смог спать)',
                        en: 'More than 3 times (sleep was disturbed)',
                    }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'breathShortness',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: '5. Nafas qisishi bormi?',
                    ru: '5. Есть ли одышка?',
                    en: '5. Is there shortness of breath?',
                },
                options: [
                    makeOption('none', { uz: "Yo'q", ru: 'Нет', en: 'No' }),
                    makeOption('mild', {
                        uz: 'Yengil (harakat payti)',
                        ru: 'Легкая (при движении)',
                        en: 'Mild (during activity)',
                    }),
                    makeOption('moderate', {
                        uz: "O'rtacha (tinch holatda ham)",
                        ru: 'Средняя (даже в покое)',
                        en: 'Moderate (even at rest)',
                    }),
                    makeOption('severe', {
                        uz: "Kuchli (ingalyatorsiz o'tmaydi)",
                        ru: 'Сильная (без ингалятора не проходит)',
                        en: 'Severe (does not improve without inhaler)',
                    }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'inhalerUsage',
                type: 'radio',
                required: true,
                label: {
                    uz: "6. Ingalyatorni necha marta qo'lladingiz?",
                    ru: '6. Сколько раз использовали ингалятор?',
                    en: '6. How many times was the inhaler used?',
                },
                options: [
                    makeOption('0', { uz: '0', ru: '0', en: '0' }),
                    makeOption('1', { uz: '1', ru: '1', en: '1' }),
                    makeOption('2', { uz: '2', ru: '2', en: '2' }),
                    makeOption('3plus', { uz: "3 va undan ko'p", ru: '3 и более', en: '3 or more' }),
                ],
            },
            {
                name: 'breathing',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: '7. Nafas olish qanday?',
                    ru: '7. Как проходило дыхание?',
                    en: '7. How was breathing today?',
                },
                options: [
                    makeOption('comfortable', {
                        uz: "Bezovta qilmadi",
                        ru: 'Не беспокоило',
                        en: 'Breathing was comfortable',
                    }),
                    makeOption('difficult', {
                        uz: "Qiyin kuch bilan nafas oldi",
                        ru: 'Дышал с трудом',
                        en: 'Breathing was difficult',
                    }),
                    makeOption('attack', {
                        uz: "Xuruj bo'ldi",
                        ru: 'Был приступ',
                        en: 'There was an attack',
                    }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'temperature',
                type: 'text',
                required: true,
                label: {
                    uz: '8. Tana harorati:',
                    ru: '8. Температура тела:',
                    en: '8. Body temperature:',
                },
            },
            {
                name: 'peakFlow',
                type: 'text',
                label: {
                    uz: "9. Pikfloumetr natijasi (agar bo'lsa):",
                    ru: '9. Результат пикфлоуметра (если есть):',
                    en: '9. Peak flow result (if available):',
                },
            },
            {
                name: 'airQuality',
                type: 'radio',
                required: true,
                label: {
                    uz: '10. Uydagi havo sifati qanday?',
                    ru: '10. Какое качество воздуха дома?',
                    en: '10. How is the air quality at home?',
                },
                options: [
                    makeOption('clean', {
                        uz: 'Toza va quruq',
                        ru: 'Чистый и сухой',
                        en: 'Clean and dry',
                    }),
                    makeOption('humid', {
                        uz: 'Nam, toza emas',
                        ru: 'Влажный, не очень чистый',
                        en: 'Humid, not clean',
                    }),
                    makeOption('dusty', {
                        uz: 'Changli, allergiya chaqirishi mumkin',
                        ru: 'Пыльный, может вызвать аллергию',
                        en: 'Dusty, may trigger allergies',
                    }),
                ],
            },
            {
                name: 'trigger',
                type: 'radio',
                allowOther: true,
                label: {
                    uz: "11. Astmani qo'zg'atgan omil kuzatildimi?",
                    ru: '11. Замечен ли провоцирующий фактор астмы?',
                    en: '11. Was an asthma trigger noticed?',
                },
                options: [
                    makeOption('none', { uz: "Yo'q", ru: 'Нет', en: 'No' }),
                    makeOption('pollen', {
                        uz: 'Polen / gul changlari',
                        ru: 'Пыльца / цветение',
                        en: 'Pollen / flower dust',
                    }),
                    makeOption('fur', {
                        uz: 'Hayvon junlari',
                        ru: 'Шерсть животных',
                        en: 'Animal fur',
                    }),
                    makeOption('pollution', {
                        uz: 'Havo ifloslanishi',
                        ru: 'Загрязнение воздуха',
                        en: 'Air pollution',
                    }),
                    makeOption('coldExercise', {
                        uz: "Sovuq / haddan tashqari harakat",
                        ru: 'Холод / чрезмерная нагрузка',
                        en: 'Cold / excessive activity',
                    }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'controllerMedication',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "12. Doimiy dori (ingalyator, sirop) foydalanildimi?",
                    ru: '12. Использовалось ли базисное лекарство (ингалятор, сироп)?',
                    en: '12. Was the regular medicine used today (inhaler, syrup)?',
                },
                options: [
                    makeOption('onTime', {
                        uz: "Ha, o'z vaqtida",
                        ru: 'Да, вовремя',
                        en: 'Yes, on time',
                    }),
                    makeOption('missed', {
                        uz: "Yo'q, unutilgan",
                        ru: 'Нет, забыли',
                        en: 'No, it was missed',
                    }),
                    makeOption('reduced', {
                        uz: 'Kam miqdorda',
                        ru: 'В меньшем объеме',
                        en: 'Used in a smaller amount',
                    }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'overallDay',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: '13. Bugungi kun uchun umumiy baho:',
                    ru: '13. Общая оценка сегодняшнего дня:',
                    en: '13. Overall assessment for today:',
                },
                options: [
                    makeOption('veryGood', {
                        uz: "Juda yaxshi - simptomlar yo'q",
                        ru: 'Очень хорошо - симптомов нет',
                        en: 'Very good - no symptoms',
                    }),
                    makeOption('average', {
                        uz: "O'rtacha - yengil belgilari bor",
                        ru: 'Средне - есть легкие симптомы',
                        en: 'Average - mild symptoms present',
                    }),
                    makeOption('bad', {
                        uz: "Yomon - nafas qisishi yoki xuruj bo'ldi",
                        ru: 'Плохо - была одышка или приступ',
                        en: 'Poor - shortness of breath or attack occurred',
                    }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'notes',
                type: 'textarea',
                label: {
                    uz: "14. Qo'shimcha izoh:",
                    ru: '14. Дополнительные комментарии:',
                    en: '14. Additional notes:',
                },
            },
        ],
    },
    {
        key: 'blood-pressure',
        icon: <CheckCircleOutlined />,
        accent: '#fa8c16',
        title: { uz: 'Qon bosimi', ru: 'Артериальное давление', en: 'Blood pressure' },
        description: {
            uz: "Qon bosimi, puls, dori va bog'liq simptomlarni yig'ish.",
            ru: 'Сбор данных о давлении, пульсе, лекарствах и симптомах.',
            en: 'Collects blood pressure, pulse, medicine use, and related symptoms.',
        },
        intro: {
            uz: "Ushbu forma bolalarda qon bosimi holatini kundalik monitoring qilish uchun ishlatiladi.",
            ru: 'Эта форма используется для ежедневного контроля артериального давления у детей.',
            en: 'This form is used for daily blood pressure monitoring in children.',
        },
        questions: [
            {
                name: 'fullName',
                type: 'text',
                required: true,
                label: {
                    uz: '1. Bolaning ismi va familiyasi:',
                    ru: '1. Имя и фамилия ребенка:',
                    en: '1. Child full name:',
                },
            },
            {
                name: 'age',
                type: 'number',
                required: true,
                min: 0,
                max: 18,
                label: { uz: '2. Yoshi:', ru: '2. Возраст:', en: '2. Age:' },
            },
            {
                name: 'bloodPressure',
                type: 'text',
                required: true,
                label: {
                    uz: '3. Bugungi qon bosimi (mmHg):',
                    ru: '3. Сегодняшнее артериальное давление (мм рт.ст.):',
                    en: '3. Today’s blood pressure (mmHg):',
                },
            },
            {
                name: 'pulse',
                type: 'text',
                required: true,
                label: {
                    uz: '4. Yurak urishi puls:',
                    ru: '4. Пульс:',
                    en: '4. Heart rate / pulse:',
                },
            },
            {
                name: 'medicationTaken',
                type: 'radio',
                required: true,
                label: {
                    uz: '5. Bugun belgilangan dori vositalarini ichdingizmi?',
                    ru: '5. Были ли сегодня приняты назначенные лекарства?',
                    en: '5. Were the prescribed medicines taken today?',
                },
                options: [makeOption('yes', YES_NO.yes), makeOption('no', YES_NO.no)],
            },
            {
                name: 'headache',
                type: 'radio',
                required: true,
                label: {
                    uz: "6. Bosh og'rig'i bo'ldimi?",
                    ru: '6. Была ли головная боль?',
                    en: '6. Was there a headache?',
                },
                options: [
                    makeOption('none', { uz: "Yo'q", ru: 'Нет', en: 'No' }),
                    makeOption('mild', { uz: 'Yengil', ru: 'Легкая', en: 'Mild' }),
                    makeOption('strong', { uz: 'Kuchli', ru: 'Сильная', en: 'Severe' }),
                ],
            },
            {
                name: 'nausea',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "7. Ko'ngil aynishi bo'ldimi?",
                    ru: '7. Была ли тошнота?',
                    en: '7. Was there nausea?',
                },
                options: [
                    makeOption('yes', YES_NO.yes),
                    makeOption('no', YES_NO.no),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'sleep',
                type: 'radio',
                required: true,
                allowOther: true,
                label: {
                    uz: "8. Bugungi uyqu holatingiz qanday bo'ldi?",
                    ru: '8. Как прошел сон сегодня?',
                    en: '8. How was sleep today?',
                },
                options: [
                    makeOption('good', { uz: 'Yaxshi', ru: 'Хорошо', en: 'Good' }),
                    makeOption('bad', { uz: 'Yomon', ru: 'Плохо', en: 'Poor' }),
                    makeOption('other', YES_NO.other),
                ],
            },
            {
                name: 'activity',
                type: 'radio',
                required: true,
                label: {
                    uz: "9. Faol harakat (sport, yurish) bo'ldimi?",
                    ru: '9. Была ли физическая активность (спорт, прогулка)?',
                    en: '9. Was there physical activity (sport, walking)?',
                },
                options: [makeOption('yes', YES_NO.yes), makeOption('no', YES_NO.no)],
            },
            {
                name: 'blackDots',
                type: 'radio',
                required: true,
                label: {
                    uz: "10. Ko'z oldida qora nuqtalar:",
                    ru: '10. Были ли черные точки перед глазами?',
                    en: '10. Were there black spots before the eyes?',
                },
                options: [
                    makeOption('yes', { uz: 'Bor', ru: 'Есть', en: 'Present' }),
                    makeOption('no', { uz: "Yo'q", ru: 'Нет', en: 'No' }),
                ],
            },
            {
                name: 'saltyFood',
                type: 'radio',
                required: true,
                label: {
                    uz: "11. Bugun tuzli ovqat yedimi?",
                    ru: '11. Ел ли ребенок сегодня соленую пищу?',
                    en: '11. Did the child eat salty food today?',
                },
                options: [makeOption('yes', YES_NO.yes), makeOption('no', YES_NO.no)],
            },
            {
                name: 'stress',
                type: 'radio',
                required: true,
                label: {
                    uz: "12. Bugun stress bo'ldimi?",
                    ru: '12. Был ли сегодня стресс?',
                    en: '12. Was there stress today?',
                },
                options: [makeOption('yes', YES_NO.yes), makeOption('no', YES_NO.no)],
            },
            {
                name: 'notes',
                type: 'textarea',
                label: {
                    uz: "13. Qo'shimcha izoh:",
                    ru: '13. Дополнительные комментарии:',
                    en: '13. Additional notes:',
                },
            },
        ],
    },
];

const fallbackText = {
    uz: {
        diabetes: {
            green: {
                reason: "Javoblarga ko'ra bugungi holat nisbatan barqaror ko'rinadi va diabet nazorati qoniqarli bo'lishi mumkin.",
                advice:
                    "Belgilangan insulin yoki dorilarni davom ettiring, reja bo'yicha ovqatlaning va glyukozani muntazam nazorat qiling.",
            },
            yellow: {
                reason: "Bugungi javoblarda kuzatuv talab qiladigan o'zgarishlar bor. Qandli diabet bo'yicha rejimni yaqin nazorat qilish kerak.",
                advice:
                    "Glyukozani qayta o'lchang, ovqat va dori vaqtlarini tekshiring, simptomlar davom etsa pediatr yoki endokrinolog bilan bog'laning.",
            },
            red: {
                reason: "Glyukoza nazorati va umumiy holatda xavotirli belgilar bor. Bola holatini bugun shifokor ko'rib chiqishi kerak.",
                advice:
                    "Qon shakarini qayta tekshiring, dorilar qabulini aniqlang, suyuqlik va ovqatlanishni nazorat qiling. Holat yomonlashsa yoki hushsizlik, qusish, juda kuchli chanqash bo'lsa zudlik bilan shoshilinch yordamga murojaat qiling.",
            },
        },
        asthma: {
            green: {
                reason: "Javoblarga ko'ra astma holati hozircha nisbatan nazorat ostida ko'rinadi.",
                advice:
                    "Uy havosini toza saqlang, kundalik dori rejimini davom ettiring va simptomlar paydo bo'lsa qayta baholang.",
            },
            yellow: {
                reason: "Yengil yoki o'rtacha darajadagi astma belgilarini ko'rsatuvchi javoblar bor, bugun qo'shimcha kuzatuv kerak.",
                advice:
                    "Qo'zg'atuvchi omillarni kamaytiring, dori va ingalyatorni reja bo'yicha qo'llang. Yo'tal yoki nafas qisishi ortsa shifokor bilan bog'laning.",
            },
            red: {
                reason: "Astma nazoratida xavfli belgilar bor: nafas qisishi yoki xuruj ehtimoli yuqori ko'rinadi.",
                advice:
                    "Ingalyator rejasini tekshiring va bolaning nafasini yaqindan kuzating. Nafas olish qiyinlashsa, ko'krak tortilishi yoki gapira olmaslik bo'lsa darhol shoshilinch yordamga murojaat qiling.",
            },
        },
        'blood-pressure': {
            green: {
                reason: "Javoblarga ko'ra bugungi qon bosimi monitoringi nisbatan barqaror ko'rinadi.",
                advice:
                    "Belgilangan dori va sog'lom tartibni davom ettiring, qon bosimi va pulsni muntazam yozib boring.",
            },
            yellow: {
                reason: "Bugungi natijalarda qon bosimi bo'yicha ehtiyotkor kuzatuv talab qiladigan belgilar bor.",
                advice:
                    "Ovqatlanishdagi tuz miqdorini kamaytiring, dam olishga e'tibor bering va qon bosimini qayta nazorat qiling. Belgilar davom etsa shifokor bilan bog'laning.",
            },
            red: {
                reason: "Qon bosimi bilan bog'liq xavotirli belgilar bo'lishi mumkin. Bola holatini kechiktirmasdan baholash kerak.",
                advice:
                    "Qon bosimi va pulsni qayta o'lchang, bolani tinch holatda ushlang, dori qabulini tekshiring. Kuchli bosh og'rig'i, ko'rish o'zgarishi yoki holsizlik kuchaysa zudlik bilan shifokorga murojaat qiling.",
            },
        },
    },
    ru: {
        diabetes: {
            green: {
                reason: 'По ответам состояние сегодня выглядит относительно стабильным, контроль диабета может быть удовлетворительным.',
                advice: 'Продолжайте назначенный инсулин или лекарства, соблюдайте режим питания и регулярно контролируйте глюкозу.',
            },
            yellow: {
                reason: 'В ответах есть изменения, требующие наблюдения. Режим контроля диабета нужно внимательно отслеживать.',
                advice: 'Повторно измерьте глюкозу, проверьте время еды и лекарств. Если симптомы сохраняются, свяжитесь с педиатром или эндокринологом.',
            },
            red: {
                reason: 'Есть тревожные признаки в контроле глюкозы и общем состоянии. Сегодня ребенка должен осмотреть врач.',
                advice: 'Повторно проверьте сахар, уточните прием лекарств, следите за питьем и питанием. При ухудшении, рвоте, сильной жажде или сонливости срочно обратитесь за помощью.',
            },
        },
        asthma: {
            green: {
                reason: 'По ответам астма сейчас выглядит относительно контролируемой.',
                advice: 'Поддерживайте чистый воздух дома, продолжайте ежедневную терапию и повторно оцените состояние при появлении симптомов.',
            },
            yellow: {
                reason: 'Есть признаки легких или умеренных симптомов астмы, сегодня требуется дополнительное наблюдение.',
                advice: 'Снизьте влияние триггеров, используйте лекарства по плану. Если кашель или одышка усилятся, свяжитесь с врачом.',
            },
            red: {
                reason: 'Есть опасные признаки плохого контроля астмы: высок риск одышки или приступа.',
                advice: 'Проверьте план ингалятора и внимательно следите за дыханием ребенка. При усилении одышки, втяжении грудной клетки или невозможности говорить срочно обращайтесь за помощью.',
            },
        },
        'blood-pressure': {
            green: {
                reason: 'По ответам контроль артериального давления сегодня выглядит относительно стабильным.',
                advice: 'Продолжайте назначенные лекарства и здоровый режим, регулярно записывайте давление и пульс.',
            },
            yellow: {
                reason: 'Есть признаки, требующие осторожного наблюдения за артериальным давлением.',
                advice: 'Снизьте количество соли, уделите внимание отдыху и повторно измерьте давление. Если симптомы сохраняются, свяжитесь с врачом.',
            },
            red: {
                reason: 'Есть тревожные признаки, связанные с артериальным давлением. Ребенка нужно оценить без промедления.',
                advice: 'Повторно измерьте давление и пульс, обеспечьте покой, проверьте прием лекарств. При сильной головной боли, изменении зрения или слабости срочно обратитесь к врачу.',
            },
        },
    },
    en: {
        diabetes: {
            green: {
                reason: 'Based on the answers, the child appears relatively stable today and diabetes control may be satisfactory.',
                advice: 'Continue insulin or other prescribed medicines, keep meals on schedule, and monitor glucose regularly.',
            },
            yellow: {
                reason: 'There are changes in today’s answers that require closer follow-up. Diabetes management should be monitored carefully.',
                advice: 'Recheck glucose, review meal and medicine timing, and contact the pediatrician or endocrinologist if symptoms continue.',
            },
            red: {
                reason: 'There are concerning signs in glucose control and overall condition. The child should be reviewed by a doctor today.',
                advice: 'Recheck blood sugar, confirm medicine use, and monitor hydration and meals. Seek urgent care if the child worsens, vomits, becomes unusually sleepy, or is extremely thirsty.',
            },
        },
        asthma: {
            green: {
                reason: 'Based on the answers, the asthma appears relatively controlled at the moment.',
                advice: 'Keep the home air clean, continue routine medicines, and reassess if symptoms appear again.',
            },
            yellow: {
                reason: 'There are signs of mild to moderate asthma symptoms, so extra observation is needed today.',
                advice: 'Reduce trigger exposure and continue inhaler or medicine use as prescribed. Contact a doctor if cough or shortness of breath gets worse.',
            },
            red: {
                reason: 'There are dangerous signs of poor asthma control, with higher concern for shortness of breath or an attack.',
                advice: 'Check the inhaler plan and watch the child’s breathing closely. Seek urgent medical help if breathing becomes harder, the chest pulls in, or the child cannot speak comfortably.',
            },
        },
        'blood-pressure': {
            green: {
                reason: 'Based on the answers, blood pressure monitoring appears relatively stable today.',
                advice: 'Continue prescribed medicines and healthy routines, and keep recording blood pressure and pulse regularly.',
            },
            yellow: {
                reason: 'Today’s answers suggest findings that need careful blood pressure follow-up.',
                advice: 'Reduce salty foods, prioritize rest, and recheck blood pressure. Contact a doctor if symptoms continue.',
            },
            red: {
                reason: 'There may be concerning signs related to blood pressure. The child should be assessed without delay.',
                advice: 'Recheck blood pressure and pulse, keep the child calm, and review medicine use. Seek medical attention quickly if severe headache, visual changes, or weakness develop.',
            },
        },
    },
};

const scoreLabels = (langCopy) => ({
    GREEN: langCopy.stable,
    YELLOW: langCopy.watch,
    RED: langCopy.urgent,
    GRAY: langCopy.review,
});

const statusTone = {
    GREEN: { color: 'green', banner: 'success' },
    YELLOW: { color: 'gold', banner: 'warning' },
    RED: { color: 'red', banner: 'error' },
    GRAY: { color: 'default', banner: 'info' },
};

const getInitialLanguage = () => {
    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return saved && ['uz', 'ru', 'en'].includes(saved) ? saved : 'uz';
    } catch {
        return 'uz';
    }
};

const getSavedHistory = () => {
    try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const formatAnswer = (question, values, language) => {
    const rawValue = values[question.name];

    if (question.type === 'slider' || question.type === 'number') {
        return rawValue ?? '';
    }

    if (question.allowOther && rawValue === OTHER_VALUE) {
        return values[`${question.name}Other`] || copy[language].noAnswer;
    }

    if (question.options) {
        const found = question.options.find((option) => option.value === rawValue);
        if (found) {
            return found.label[language];
        }
    }

    return rawValue || '';
};

const buildPrompt = (condition, values, language) => {
    const langCopy = copy[language];
    const lines = condition.questions.map((question) => {
        const answer = formatAnswer(question, values, language) || langCopy.noAnswer;
        return `${question.label[language]} ${answer}`;
    });

    return [
        `${langCopy.promptCondition}: ${condition.title[language]}.`,
        `${langCopy.patientLabel}: ${langCopy.patientChild}.`,
        langCopy.promptInstruction,
        langCopy.promptFormat,
        langCopy.promptUrgent,
        langCopy.respondIn,
        '',
        ...lines,
    ].join('\n');
};

const fallbackEvaluate = (conditionKey, values, language) => {
    let score = 0;

    if (conditionKey === 'diabetes') {
        const glucoseNumber = Number.parseFloat(String(values.glucose || '').replace(',', '.'));

        if (!Number.isNaN(glucoseNumber) && (glucoseNumber < 4 || glucoseNumber > 13)) score += 3;
        if (values.medicationTaken === 'no') score += 2;
        if (values.sweets === 'yes') score += 1;
        if (values.urination === 'yes') score += 2;
        if (values.feeling === 'bad') score += 3;
        if (values.feeling === 'tired') score += 1;
        if (values.activity === 'no') score += 1;
        if ((values.mood ?? 10) <= 3) score += 2;
        else if ((values.mood ?? 10) <= 5) score += 1;

        if (score >= 6) {
            return { color: 'RED', ...fallbackText[language].diabetes.red };
        }

        if (score >= 3) {
            return { color: 'YELLOW', ...fallbackText[language].diabetes.yellow };
        }

        return { color: 'GREEN', ...fallbackText[language].diabetes.green };
    }

    if (conditionKey === 'asthma') {
        if (values.nightCough === 'many') score += 3;
        if (values.nightCough === 'twoThree') score += 2;
        if (values.breathShortness === 'severe') score += 4;
        if (values.breathShortness === 'moderate') score += 3;
        if (values.breathShortness === 'mild') score += 1;
        if (values.inhalerUsage === '3plus') score += 3;
        if (values.inhalerUsage === '2') score += 2;
        if (values.breathing === 'attack') score += 4;
        if (values.breathing === 'difficult') score += 2;
        if (values.controllerMedication === 'missed') score += 2;
        if (values.overallDay === 'bad') score += 3;
        if (values.airQuality === 'dusty') score += 1;

        if (score >= 7) {
            return { color: 'RED', ...fallbackText[language].asthma.red };
        }

        if (score >= 3) {
            return { color: 'YELLOW', ...fallbackText[language].asthma.yellow };
        }

        return { color: 'GREEN', ...fallbackText[language].asthma.green };
    }

    const pressure = String(values.bloodPressure || '');
    const pulseNumber = Number.parseInt(String(values.pulse || '').match(/\d+/)?.[0] || '', 10);

    if (/\d{3}/.test(pressure)) score += 2;
    if (!Number.isNaN(pulseNumber) && pulseNumber > 120) score += 2;
    if (values.medicationTaken === 'no') score += 2;
    if (values.headache === 'strong') score += 3;
    if (values.headache === 'mild') score += 1;
    if (values.nausea === 'yes') score += 1;
    if (values.sleep === 'bad') score += 1;
    if (values.blackDots === 'yes') score += 3;
    if (values.saltyFood === 'yes') score += 1;
    if (values.stress === 'yes') score += 1;

    if (score >= 6) {
        return { color: 'RED', ...fallbackText[language]['blood-pressure'].red };
    }

    if (score >= 3) {
        return { color: 'YELLOW', ...fallbackText[language]['blood-pressure'].yellow };
    }

    return { color: 'GREEN', ...fallbackText[language]['blood-pressure'].green };
};

const getNormalizedResult = (data, fallback) => ({
    color: data?.color || fallback.color,
    reason: data?.reason || data?.condition || fallback.reason,
    advice: data?.advice || data?.recommendation || fallback.advice,
});

const ResultCard = ({ result, title, language }) => {
    const langCopy = copy[language];
    const labels = scoreLabels(langCopy);
    const tone = statusTone[result.color] || statusTone.GRAY;

    return (
        <Card
            style={{
                borderRadius: 28,
                borderColor: '#d9e3f0',
                boxShadow: '0 24px 70px rgba(15, 23, 42, 0.08)',
            }}
        >
            <Space direction="vertical" size={18} style={{ width: '100%' }}>
                <Space wrap>
                    <Tag color={tone.color} style={{ paddingInline: 14, paddingBlock: 6, borderRadius: 999 }}>
                        {labels[result.color] || labels.GRAY}
                    </Tag>
                    <Text type="secondary">{title}</Text>
                </Space>

                <Alert
                    type={tone.banner}
                    showIcon
                    message={langCopy.resultTitle}
                    description={result.reason}
                    style={{ borderRadius: 18 }}
                />

                <Card
                    size="small"
                    style={{
                        borderRadius: 20,
                        background: '#f8fafc',
                        borderColor: '#e2e8f0',
                    }}
                >
                    <Text strong>{langCopy.recommendation}</Text>
                    <Paragraph style={{ marginTop: 10, marginBottom: 0 }}>{result.advice}</Paragraph>
                </Card>
            </Space>
        </Card>
    );
};

const QuestionField = ({ question, form, language }) => {
    const langCopy = copy[language];
    const radioValue = Form.useWatch(question.name, form);

    if (question.type === 'textarea') {
        return (
            <Form.Item
                label={question.label[language]}
                name={question.name}
                rules={question.required ? [{ required: true, message: langCopy.fieldRequired }] : []}
            >
                <Input.TextArea rows={4} placeholder={langCopy.areaPlaceholder} />
            </Form.Item>
        );
    }

    if (question.type === 'text') {
        return (
            <Form.Item
                label={question.label[language]}
                name={question.name}
                rules={question.required ? [{ required: true, message: langCopy.fieldRequired }] : []}
            >
                <Input placeholder={langCopy.textPlaceholder} />
            </Form.Item>
        );
    }

    if (question.type === 'number') {
        return (
            <Form.Item
                label={question.label[language]}
                name={question.name}
                rules={question.required ? [{ required: true, message: langCopy.fieldRequired }] : []}
            >
                <InputNumber
                    min={question.min}
                    max={question.max}
                    style={{ width: '100%' }}
                    placeholder={langCopy.numberPlaceholder}
                />
            </Form.Item>
        );
    }

    if (question.type === 'slider') {
        return (
            <Form.Item
                label={question.label[language]}
                name={question.name}
                rules={question.required ? [{ required: true, message: langCopy.moodRequired }] : []}
            >
                <Slider min={question.min} max={question.max} marks={question.marks[language]} />
            </Form.Item>
        );
    }

    return (
        <>
            <Form.Item
                label={question.label[language]}
                name={question.name}
                rules={question.required ? [{ required: true, message: langCopy.optionRequired }] : []}
            >
                <Radio.Group style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {question.options.map((option) => (
                            <Radio key={option.value} value={option.value === 'other' ? OTHER_VALUE : option.value}>
                                {option.label[language]}
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>
            </Form.Item>

            {question.allowOther && radioValue === OTHER_VALUE ? (
                <Form.Item
                    name={`${question.name}Other`}
                    rules={[{ required: true, message: langCopy.otherRequired }]}
                    style={{ marginTop: -6 }}
                >
                    <Input placeholder={langCopy.textPlaceholder} />
                </Form.Item>
            ) : null}
        </>
    );
};

function FormsSympthoms() {
    const [language, setLanguage] = useState(getInitialLanguage);
    const [selectedConditionKey, setSelectedConditionKey] = useState(conditions[0].key);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(getSavedHistory);
    const [form] = Form.useForm();
    const { message } = App.useApp();

    const langCopy = copy[language];
    const selectedCondition = useMemo(
        () => conditions.find((item) => item.key === selectedConditionKey) || conditions[0],
        [selectedConditionKey]
    );

    useEffect(() => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const resetCurrentForm = () => {
        form.resetFields();
        setResult(null);
    };

    const handleConditionChange = (nextKey) => {
        setSelectedConditionKey(nextKey);
        resetCurrentForm();
    };

    const saveHistory = (values, nextResult) => {
        const entry = {
            id: Date.now(),
            conditionKey: selectedCondition.key,
            values,
            result: nextResult,
            language,
            createdAt: new Date().toISOString(),
        };

        setHistory((previous) => [entry, ...previous].slice(0, 12));
    };

    const handleSubmit = async (values) => {
        const prompt = buildPrompt(selectedCondition, values, language);
        const fallback = fallbackEvaluate(selectedCondition.key, values, language);

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(ANALYZE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: prompt, language }),
            });

            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await response.json() : null;

            if (!response.ok) {
                throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
            }

            const normalized = getNormalizedResult(data, fallback);
            setResult(normalized);
            saveHistory(values, normalized);
            message.success(langCopy.analyzeSuccess);
        } catch (error) {
            const localResult = {
                ...fallback,
                advice: `${fallback.advice} ${langCopy.autoFallbackPrefix}: ${error.message}.`,
            };

            setResult(localResult);
            saveHistory(values, localResult);
            message.warning(langCopy.analyzeFallback);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreHistory = (item) => {
        setLanguage(item.language || 'uz');
        setSelectedConditionKey(item.conditionKey);
        setResult(item.result || null);
        form.setFieldsValue(item.values || {});
    };

    const labels = scoreLabels(langCopy);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: selectedCondition.accent,
                    borderRadius: 18,
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                },
            }}
        >
            <App>
                <div
                    style={{
                        minHeight: '100vh',
                        background:
                            'radial-gradient(circle at top left, rgba(22,119,255,0.16), transparent 28%), radial-gradient(circle at top right, rgba(19,194,194,0.14), transparent 24%), linear-gradient(180deg, #f3f8ff 0%, #eef7f3 100%)',
                        padding: '20px 12px 40px',
                    }}
                >
                    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                        <Card
                            style={{
                                borderRadius: 32,
                                border: '1px solid rgba(217, 227, 240, 0.9)',
                                boxShadow: '0 28px 80px rgba(15, 23, 42, 0.10)',
                                overflow: 'hidden',
                            }}
                            styles={{ body: { padding: 0 } }}
                        >
                            <Row gutter={0}>
                                <Col xs={24} xl={8}>
                                    <div
                                        style={{
                                            height: '100%',
                                            padding: 24,
                                            background:
                                                'linear-gradient(180deg, rgba(9, 22, 43, 0.96) 0%, rgba(18, 42, 77, 0.92) 100%)',
                                            color: '#fff',
                                        }}
                                    >
                                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                            <Tag
                                                color="cyan"
                                                style={{
                                                    width: 'fit-content',
                                                    borderRadius: 999,
                                                    paddingInline: 14,
                                                    paddingBlock: 6,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {langCopy.appTag}
                                            </Tag>

                                            <div>
                                                <Title
                                                    level={2}
                                                    style={{
                                                        color: '#fff',
                                                        marginTop: 0,
                                                        marginBottom: 10,
                                                        fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
                                                        lineHeight: 1.15,
                                                    }}
                                                >
                                                    {langCopy.title}
                                                </Title>
                                                <Paragraph
                                                    style={{
                                                        color: 'rgba(255,255,255,0.78)',
                                                        fontSize: 15,
                                                        marginBottom: 0,
                                                    }}
                                                >
                                                    {langCopy.subtitle}
                                                </Paragraph>
                                            </div>

                                            <Card
                                                size="small"
                                                style={{
                                                    borderRadius: 22,
                                                    background: 'rgba(255,255,255,0.08)',
                                                    borderColor: 'rgba(255,255,255,0.12)',
                                                }}
                                                styles={{ body: { padding: 16 } }}
                                            >
                                                <Text style={{ display: 'block', color: '#dbeafe', marginBottom: 10 }}>
                                                    {langCopy.language}
                                                </Text>
                                                <Segmented
                                                    block
                                                    options={LANGUAGES}
                                                    value={language}
                                                    onChange={(value) => setLanguage(value)}
                                                />
                                            </Card>

                                            <Divider style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '4px 0' }} />

                                            <div>
                                                <Text style={{ display: 'block', color: '#dbeafe', marginBottom: 12 }}>
                                                    {langCopy.pickerLabel}
                                                </Text>
                                                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                                    {conditions.map((item) => {
                                                        const active = item.key === selectedConditionKey;

                                                        return (
                                                            <button
                                                                key={item.key}
                                                                type="button"
                                                                onClick={() => handleConditionChange(item.key)}
                                                                style={{
                                                                    width: '100%',
                                                                    textAlign: 'left',
                                                                    borderRadius: 22,
                                                                    padding: '16px 16px',
                                                                    border: active
                                                                        ? `1px solid ${item.accent}`
                                                                        : '1px solid rgba(255,255,255,0.12)',
                                                                    background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                                                                    color: '#fff',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                                                                        <Space>
                                                                            <span style={{ color: item.accent, fontSize: 18 }}>{item.icon}</span>
                                                                            {item.title[language]}
                                                                        </Space>
                                                                    </Text>
                                                                    <Text style={{ color: 'rgba(255,255,255,0.72)' }}>
                                                                        {item.description[language]}
                                                                    </Text>
                                                                </Space>
                                                            </button>
                                                        );
                                                    })}
                                                </Space>
                                            </div>

                                            <Alert
                                                style={{ marginTop: 6, borderRadius: 20 }}
                                                type="warning"
                                                showIcon
                                                message={langCopy.important}
                                                description={langCopy.importantBody}
                                            />

                                            <Card
                                                size="small"
                                                style={{
                                                    borderRadius: 24,
                                                    background: 'rgba(255,255,255,0.08)',
                                                    borderColor: 'rgba(255,255,255,0.12)',
                                                }}
                                                styles={{ body: { padding: 16 } }}
                                            >
                                                <Space
                                                    align="center"
                                                    style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}
                                                >
                                                    <Text style={{ color: '#fff', fontWeight: 700 }}>
                                                        <Space>
                                                            <HistoryOutlined />
                                                            {langCopy.historyTitle}
                                                        </Space>
                                                    </Text>
                                                    {history.length > 0 ? (
                                                        <Button size="small" onClick={() => setHistory([])}>
                                                            {langCopy.clearHistory}
                                                        </Button>
                                                    ) : null}
                                                </Space>

                                                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                                    {history.length > 0 ? (
                                                        history.map((item) => {
                                                            const conditionTitle =
                                                                conditions.find((condition) => condition.key === item.conditionKey)?.title[language] ||
                                                                item.conditionKey;
                                                            const patientName = item.values?.fullName || '-';
                                                            const tone = statusTone[item.result?.color] || statusTone.GRAY;

                                                            return (
                                                                <button
                                                                    key={item.id}
                                                                    type="button"
                                                                    onClick={() => handleRestoreHistory(item)}
                                                                    style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: 14,
                                                                        borderRadius: 18,
                                                                        border: '1px solid rgba(255,255,255,0.10)',
                                                                        background: 'rgba(255,255,255,0.05)',
                                                                        color: '#fff',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                                        <Space wrap>
                                                                            <Text style={{ color: '#fff', fontWeight: 700 }}>{conditionTitle}</Text>
                                                                            <Tag color={tone.color}>{labels[item.result?.color] || labels.GRAY}</Tag>
                                                                        </Space>
                                                                        <Text style={{ color: 'rgba(255,255,255,0.78)' }}>{patientName}</Text>
                                                                        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                                                                            {new Date(item.createdAt).toLocaleString(item.language || language)}
                                                                        </Text>
                                                                    </Space>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div
                                                            style={{
                                                                borderRadius: 18,
                                                                background: 'rgba(255,255,255,0.04)',
                                                                padding: 16,
                                                            }}
                                                        >
                                                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={langCopy.historyEmpty} />
                                                        </div>
                                                    )}
                                                </Space>
                                            </Card>
                                        </Space>
                                    </div>
                                </Col>

                                <Col xs={24} xl={16}>
                                    <div style={{ padding: 24 }}>
                                        <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24 }}>
                                            <Tag
                                                color="blue"
                                                style={{ width: 'fit-content', borderRadius: 999, paddingInline: 14, paddingBlock: 6 }}
                                            >
                                                {langCopy.selectedTag}
                                            </Tag>
                                            <Title level={3} style={{ margin: 0 }}>
                                                {selectedCondition.title[language]}
                                            </Title>
                                            <Paragraph style={{ marginBottom: 0, color: '#475569' }}>
                                                {selectedCondition.intro[language]} {langCopy.selectedHint}
                                            </Paragraph>
                                        </Space>

                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={handleSubmit}
                                            initialValues={{ mood: 5 }}
                                        >
                                            <Row gutter={[18, 0]}>
                                                {selectedCondition.questions.map((question) => (
                                                    <Col
                                                        key={question.name}
                                                        xs={24}
                                                        md={question.type === 'textarea' || question.type === 'slider' ? 24 : 12}
                                                    >
                                                        <Card
                                                            size="small"
                                                            style={{
                                                                marginBottom: 18,
                                                                borderRadius: 22,
                                                                borderColor: '#e2e8f0',
                                                                background: '#fcfdff',
                                                            }}
                                                            styles={{ body: { padding: 18 } }}
                                                        >
                                                            <QuestionField question={question} form={form} language={language} />
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>

                                            <Space wrap size={12} style={{ marginTop: 10 }}>
                                                <Button size="large" onClick={resetCurrentForm}>
                                                    {langCopy.clearForm}
                                                </Button>
                                                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                                                    {langCopy.submit}
                                                </Button>
                                            </Space>
                                        </Form>

                                        <Divider />

                                        {loading ? (
                                            <Card
                                                style={{
                                                    borderRadius: 28,
                                                    borderColor: '#d9e3f0',
                                                    textAlign: 'center',
                                                    paddingBlock: 24,
                                                }}
                                            >
                                                <Spin size="large" />
                                                <Paragraph style={{ marginTop: 18, marginBottom: 0 }}>
                                                    {langCopy.analyzing}
                                                </Paragraph>
                                            </Card>
                                        ) : null}

                                        {!loading && result ? (
                                            <ResultCard result={result} title={selectedCondition.title[language]} language={language} />
                                        ) : null}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </div>
            </App>
        </ConfigProvider>
    );
}

export default FormsSympthoms;
