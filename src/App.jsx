import React, { useEffect, useState } from 'react';
import { FiClock, FiMenu, FiPlus, FiSend, FiX } from 'react-icons/fi';

const HISTORY_STORAGE_KEY = 'med_history';
const LANGUAGE_STORAGE_KEY = 'med_language';
const SUPPORTED_LANGUAGES = ['en', 'ru', 'uz'];
const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : '')
).replace(/\/$/, '');
const ANALYZE_ENDPOINT = API_BASE_URL ? `${API_BASE_URL}/analyze` : '/analyze';

const translations = {
  en: {
    languageLabel: 'Language',
    signIn: 'Sign in',
    searchHistory: 'Search history',
    newSearch: 'New search',
    recent: 'Recent',
    clear: 'Clear',
    historyEmpty: 'Your latest symptom checks will appear here for quick access.',
    savedSearch: 'Saved search',
    appTag: 'Clinical AI assistant',
    heroTitle:
      'Understand symptoms faster with a layout that feels natural on every device.',
    heroDescription:
      'Ask about symptoms, medicines, or lab results and keep recent searches in the left sidebar like modern AI apps.',
    warning:
      'AI Med does not replace a licensed medical professional for diagnosis or emergency care.',
    starterCards: [
      {
        title: 'Look up diseases',
        desc: 'What are the causes and treatments of pneumonia?',
      },
      {
        title: 'Check drug info',
        desc: 'Provide dosage and interactions for amoxicillin.',
      },
      {
        title: 'Interpret lab tests',
        desc: 'Interpret the results of a CBC test.',
      },
    ],
    placeholder: 'Describe symptoms, medications, or lab values...',
    badgeDetailed: 'Detailed triage',
    badgeResearch: 'Research style answers',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    notesTitle: 'Interface notes',
    notes: [
      'The sidebar stays pinned on desktop and becomes a drawer on smaller screens.',
      'Recent searches are reusable, so you can tap any entry and instantly restore the previous result.',
      'The content column and cards now scale cleanly from narrow phones to large monitors.',
    ],
    status: 'status',
    backToSearch: 'Back to search',
    startNewSearch: 'Start new search',
    connectionError: 'Connection error',
    backendOffline: 'Backend is offline or unavailable.',
    analyzeFailed: 'Unable to analyze symptoms right now.',
    analysisCompleted: 'Analysis completed',
    noAdvice: 'No additional advice was returned.',
    appSubtitle: 'Science-based answers to medical questions',
  },
  ru: {
    languageLabel: 'Язык',
    signIn: 'Войти',
    searchHistory: 'История поиска',
    newSearch: 'Новый поиск',
    recent: 'Недавние',
    clear: 'Очистить',
    historyEmpty:
      'Последние проверки симптомов будут появляться здесь для быстрого доступа.',
    savedSearch: 'Сохраненный запрос',
    appTag: 'Медицинский AI-помощник',
    heroTitle:
      'Понимайте симптомы быстрее с интерфейсом, который удобно работает на любом устройстве.',
    heroDescription:
      'Спрашивайте о симптомах, лекарствах и анализах, а недавние запросы будут храниться слева, как в современных AI-сервисах.',
    warning:
      'AI Med не заменяет лицензированного врача для диагностики или экстренной помощи.',
    starterCards: [
      {
        title: 'Поиск по болезням',
        desc: 'Какие причины и методы лечения пневмонии?',
      },
      {
        title: 'Информация о лекарствах',
        desc: 'Покажи дозировку и взаимодействия амоксициллина.',
      },
      {
        title: 'Расшифровка анализов',
        desc: 'Помоги интерпретировать результаты общего анализа крови.',
      },
    ],
    placeholder: 'Опишите симптомы, лекарства или результаты анализов...',
    badgeDetailed: 'Подробный разбор',
    badgeResearch: 'Формат исследования',
    analyze: 'Анализировать',
    analyzing: 'Идет анализ...',
    notesTitle: 'Особенности интерфейса',
    notes: [
      'На компьютере боковая панель закреплена слева, а на маленьких экранах открывается как выезжающее меню.',
      'Недавние запросы можно использовать повторно: нажмите на любой пункт, и прошлый результат сразу восстановится.',
      'Основная сетка и карточки теперь аккуратно подстраиваются под телефон, планшет и большой монитор.',
    ],
    status: 'статус',
    backToSearch: 'Назад к поиску',
    startNewSearch: 'Начать новый поиск',
    connectionError: 'Ошибка соединения',
    backendOffline: 'Сервер недоступен или выключен.',
    analyzeFailed: 'Сейчас не удалось выполнить анализ симптомов.',
    analysisCompleted: 'Анализ завершен',
    noAdvice: 'Дополнительные рекомендации не были получены.',
    appSubtitle: 'Научно обоснованные ответы на медицинские вопросы',
  },
  uz: {
    languageLabel: 'Til',
    signIn: 'Kirish',
    searchHistory: 'Qidiruv tarixi',
    newSearch: 'Yangi qidiruv',
    recent: 'So‘nggilar',
    clear: 'Tozalash',
    historyEmpty:
      'Oxirgi simptom tekshiruvlaringiz tezkor kirish uchun shu yerda ko‘rinadi.',
    savedSearch: 'Saqlangan so‘rov',
    appTag: 'Tibbiy AI yordamchi',
    heroTitle:
      'Har qanday qurilmada qulay ishlaydigan interfeys bilan simptomlarni tezroq tushuning.',
    heroDescription:
      'Simptomlar, dorilar yoki tahlillar haqida so‘rang va zamonaviy AI ilovalari kabi so‘nggi qidiruvlarni chap panelda saqlang.',
    warning:
      'AI Med tashxis qo‘yish yoki shoshilinch yordam uchun litsenziyaga ega shifokor o‘rnini bosa olmaydi.',
    starterCards: [
      {
        title: 'Kasalliklarni izlash',
        desc: 'Pnevmoniyaning sabablari va davolash usullari qanday?',
      },
      {
        title: 'Dori ma’lumotlari',
        desc: 'Amoksitsillin dozasi va o‘zaro ta’sirlarini ko‘rsating.',
      },
      {
        title: 'Tahlillarni tushuntirish',
        desc: 'Umumiy qon tahlili natijalarini sharhlab bering.',
      },
    ],
    placeholder: 'Simptomlar, dorilar yoki tahlil natijalarini yozing...',
    badgeDetailed: 'Batafsil tahlil',
    badgeResearch: 'Tadqiqot uslubi',
    analyze: 'Tahlil qilish',
    analyzing: 'Tahlil qilinmoqda...',
    notesTitle: 'Interfeys haqida',
    notes: [
      'Kompyuterda chap panel doim ko‘rinadi, kichik ekranlarda esa yon tomondan ochiladi.',
      'So‘nggi qidiruvlardan qayta foydalanish mumkin: istalgan bandni bossangiz, avvalgi natija darhol tiklanadi.',
      'Asosiy bloklar va kartalar telefon, planshet va katta monitorlarda toza ko‘rinish uchun moslashadi.',
    ],
    status: 'holat',
    backToSearch: 'Qidiruvga qaytish',
    startNewSearch: 'Yangi qidiruv boshlash',
    connectionError: 'Ulanish xatosi',
    backendOffline: 'Backend ishlamayapti yoki ulanib bo‘lmadi.',
    analyzeFailed: 'Hozir simptomlarni tahlil qilib bo‘lmadi.',
    analysisCompleted: 'Tahlil yakunlandi',
    noAdvice: 'Qo‘shimcha tavsiya qaytarilmadi.',
    appSubtitle: 'Tibbiy savollarga ilmiy asoslangan javoblar',
  },
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

const getInitialLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch {
    return 'en';
  }

  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();

    if (browserLanguage && SUPPORTED_LANGUAGES.includes(browserLanguage)) {
      return browserLanguage;
    }
  }

  return 'en';
};

const getStatusTone = (color) => {
  if (color === 'RED') {
    return {
      panel: 'border-rose-200 bg-rose-50',
      badge: 'bg-rose-100 text-rose-700',
      accent: 'bg-rose-500',
    };
  }

  if (color === 'YELLOW') {
    return {
      panel: 'border-amber-200 bg-amber-50',
      badge: 'bg-amber-100 text-amber-700',
      accent: 'bg-amber-500',
    };
  }

  if (color === 'GRAY') {
    return {
      panel: 'border-slate-200 bg-slate-100',
      badge: 'bg-slate-200 text-slate-700',
      accent: 'bg-slate-500',
    };
  }

  return {
    panel: 'border-emerald-200 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    accent: 'bg-emerald-500',
  };
};

function App() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState(getSavedHistory);
  const [language, setLanguage] = useState(getInitialLanguage);

  const copy = translations[language] || translations.en;

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const resetConversation = () => {
    setSymptoms('');
    setResult(null);
    setIsSidebarOpen(false);
  };

  const handleSelectHistory = (item) => {
    setSymptoms(item.text || '');
    if (item.language && SUPPORTED_LANGUAGES.includes(item.language)) {
      setLanguage(item.language);
    }
    setResult(
      item.result || {
        color: item.color,
        reason: item.reason,
        advice: item.advice,
      }
    );
    setIsSidebarOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (!result) {
      setSymptoms('');
    }
  };

  const handleAnalyze = async () => {
    const trimmedSymptoms = symptoms.trim();

    if (trimmedSymptoms.length < 5) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: trimmedSymptoms, language }),
      });

      const responseContentType = response.headers.get('content-type') || '';
      const data = responseContentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            (response.status === 404 && !API_BASE_URL
              ? 'API endpoint is not configured for production deployment.'
              : `${copy.analyzeFailed} (HTTP ${response.status})`)
        );
      }

      const normalizedResult = {
        color: data.color || 'GREEN',
        reason: data.reason || copy.analysisCompleted,
        advice: data.advice || copy.noAdvice,
      };

      setResult(normalizedResult);
      setHistory((prevHistory) => {
        const nextEntry = {
          id: Date.now(),
          text: trimmedSymptoms,
          createdAt: new Date().toISOString(),
          language,
          result: normalizedResult,
        };

        return [
          nextEntry,
          ...prevHistory.filter((item) => item.text !== trimmedSymptoms),
        ].slice(0, 12);
      });
    } catch (error) {
      setResult({
        color: 'GRAY',
        reason: copy.connectionError,
        advice: `${copy.backendOffline} ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const resultTone = getStatusTone(result?.color);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.14),transparent_30%),linear-gradient(180deg,#f6fbfa_0%,#eef6f5_100%)] text-slate-900">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 transition duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[86%] max-w-xs flex-col border-r border-white/60 bg-slate-950 px-4 py-4 text-slate-50 shadow-2xl transition duration-300 sm:max-w-sm lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:max-w-none lg:flex-none lg:translate-x-0 lg:overflow-hidden lg:bg-[#0f1720] ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
                AI Med
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">{copy.searchHistory}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:text-white lg:hidden"
              aria-label="Close history sidebar"
            >
              <FiX size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={resetConversation}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
          >
            <FiPlus size={16} />
            {copy.newSearch}
          </button>

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {copy.recent}
            </p>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs font-medium text-slate-400 transition hover:text-white"
              >
                {copy.clear}
              </button>
            )}
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {history.length > 0 ? (
              history.map((item) => {
                const itemTone = getStatusTone(item.result?.color || item.color);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectHistory(item)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-slate-600 hover:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${itemTone.accent}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-100">
                          {item.text}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <FiClock size={12} />
                          <span>{item.result?.reason || item.reason || copy.savedSearch}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-5 text-sm leading-6 text-slate-400">
                {copy.historyEmpty}
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
                  aria-label="Open history sidebar"
                >
                  <FiMenu size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-lg font-bold text-white shadow-lg shadow-teal-500/20">
                    <span className='self-start'>A</span><span className='self-end'>M</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-teal-600">
                      AI Med
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-1">{copy.appSubtitle}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <label className="sr-only" htmlFor="language-select">
                  {copy.languageLabel}
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="uz">O&apos;zbek</option>
                </select>

                <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  {copy.signIn}
                </button>
              </div>
            </div>
          </header>

          <main className="flex flex-1 justify-center px-4 pb-8 pt-6 sm:px-6 lg:px-10 lg:pt-10">
            <div className="w-full max-w-6xl">
              <section
                className={`grid gap-6 ${result ? 'xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start' : ''}`}
              >
                <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.07)] backdrop-blur sm:p-8 lg:p-10">
                  <div className="max-w-3xl">
                    <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                      {copy.appTag}
                    </span>
                    <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                      {copy.heroTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                      {copy.heroDescription}
                    </p>
                    <div className="mt-6 inline-flex max-w-full items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                      {copy.warning}
                    </div>
                  </div>

                  {!result && !loading && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {copy.starterCards.map((card) => (
                        <button
                          key={card.title}
                          type="button"
                          onClick={() => setSymptoms(card.desc)}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-lg"
                        >
                          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{card.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
                    <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-3 sm:p-4">
                      <textarea
                        className="min-h-40 w-full resize-none bg-transparent p-2 text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400 sm:min-h-45 sm:text-lg"
                        placeholder={copy.placeholder}
                        value={symptoms}
                        onChange={(event) => setSymptoms(event.target.value)}
                      />

                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                            {copy.badgeDetailed}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                            {copy.badgeResearch}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleAnalyze}
                          disabled={loading || symptoms.trim().length < 5}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition sm:w-auto ${
                            symptoms.trim().length >= 5 && !loading
                              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 hover:bg-teal-400'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <FiSend size={16} />
                          {loading ? copy.analyzing : copy.analyze}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {result && (
                  <div className="xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pr-1">
                    <div
                      className={`rounded-4xl border p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:p-8 ${resultTone.panel}`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${resultTone.badge}`}
                        >
                          {result.color} {copy.status}
                        </span>
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                        {result.reason}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-slate-700">{result.advice}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setResult(null)}
                          className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                          {copy.backToSearch}
                        </button>
                        <button
                          type="button"
                          onClick={resetConversation}
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          {copy.startNewSearch}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
