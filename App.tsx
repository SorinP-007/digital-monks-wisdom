
import React, { useState, useCallback, useEffect } from 'react';
import { generateFortuneFromAPI } from './services/geminiService';
import LoadingIcon from './components/LoadingIcon';
import ErrorAlert from './components/ErrorAlert';

interface DropdownOption {
  value: string;
  label: string;
}

interface FortuneEntry {
  date: string;
  time: string;
  initiator: string;
  emotionState: string;
  color: string;
  focus: string;
  activity: string;
  nickname: string; // Added nickname
  fortune: string;
}

const LOCAL_STORAGE_KEY = 'digitalMonkFortuneHistory';

const initiatorOptions: DropdownOption[] = [
  { value: "I feel", label: "I feel..." },
  { value: "I am", label: "I am..." },
  { value: "I think", label: "I think..." },
  { value: "I want", label: "I want..." },
  { value: "My day was", label: "My day was..." },
  { value: "I need", label: "I need..." },
  { value: "My situation is", label: "My situation is..." },
];

const emotionStateOptions: DropdownOption[] = [
  { value: "happy", label: "😊 Happy" },
  { value: "sad", label: "😢 Sad" },
  { value: "angry", label: "😠 Angry" },
  { value: "tired", label: "😩 Tired" },
  { value: "energetic", label: "⚡️ Energetic" },
  { value: "calm", label: "😌 Calm" },
  { value: "anxious", label: "😟 Anxious" },
  { value: "confused", label: "🤔 Confused" },
  { value: "lost", label: "🧭 Lost" },
  { value: "optimistic", label: "✨ Optimistic" },
  { value: "creative", label: "🎨 Creative" },
  { value: "curious", label: "🧐 Curious" },
  { value: "overwhelmed", label: "🤯 Overwhelmed" },
  { value: "peaceful", label: "🕊️ Peaceful" },
  { value: "stuck", label: "⚙️ Stuck" },
];

const colorOptions: DropdownOption[] = [
  { value: "red, like passion or urgency", label: "🔴 Red (Passion/Urgency)" },
  { value: "blue, like calmness or melancholy", label: "🔵 Blue (Calm/Melancholy)" },
  { value: "yellow, like joy or clarity", label: "🟡 Yellow (Joy/Clarity)" },
  { value: "green, like growth or imbalance", label: "🟢 Green (Growth/Imbalance)" },
  { value: "orange, like creativity or change", label: "🟠 Orange (Creativity/Change)" },
  { value: "purple, like intuition or mystery", label: "🟣 Purple (Intuition/Mystery)" },
  { value: "black, like the unknown or endings", label: "⚫ Black (Unknown/Endings)" },
  { value: "white, like new beginnings or emptiness", label: "⚪ White (New Beginnings/Emptiness)" },
  { value: "grey, like neutrality or indecision", label: "🔘 Grey (Neutrality/Indecision)" },
  { value: "a vibrant rainbow, full of mixed signals", label: "🌈 A Rainbow (Mixed Signals)" },
];

const focusOptions: DropdownOption[] = [
  { value: "my goals and aspirations", label: "My Goals & Aspirations" },
  { value: "my work or career", label: "My Work/Career" },
  { value: "my personal relationships", label: "My Relationships" },
  { value: "the future in general", label: "The Future" },
  { value: "a specific problem I'm facing", label: "A Specific Problem" },
  { value: "a desire for change", label: "A Desire for Change" },
  { value: "finding inner peace", label: "Finding Inner Peace" },
  { value: "seeking inspiration", label: "Seeking Inspiration" },
  { value: "my daily routine", label: "My Daily Routine" },
  { value: "something I can't quite pinpoint", label: "Something I Can't Pinpoint" },
];

const activityOptions: DropdownOption[] = [
  { value: "too busy, juggling many tasks", label: "Too Busy / Juggling Tasks" },
  { value: "quite idle, with too much free time", label: "Quite Idle / Too Much Free Time" },
  { value: "overthinking things constantly", label: "Overthinking Things" },
  { value: "working hard towards something", label: "Working Hard" },
  { value: "taking time to rest and recharge", label: "Resting & Recharging" },
  { value: "achieving small victories", label: "Achieving Small Victories" },
  { value: "procrastinating more than usual", label: "Procrastinating" },
  { value: "focused on my well-being (eating, sleeping)", label: "Focused on Well-being" },
  { value: "spending a lot of time sitting or inactive", label: "Mostly Inactive/Sitting" },
  { value: "experiencing a lot of new things", label: "Experiencing New Things" },
];

const App = (): JSX.Element => {
  const [initiator, setInitiator] = useState<string>(initiatorOptions[0].value);
  const [emotionState, setEmotionState] = useState<string>(emotionStateOptions[0].value);
  const [color, setColor] = useState<string>(colorOptions[0].value);
  const [focus, setFocus] = useState<string>(focusOptions[0].value);
  const [activity, setActivity] = useState<string>(activityOptions[0].value);
  const [nickname, setNickname] = useState<string>(''); // Added state for nickname

  const [fortune, setFortune] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fortuneHistory, setFortuneHistory] = useState<FortuneEntry[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory: Partial<FortuneEntry>[] = JSON.parse(storedHistory); // Load as partial to handle old entries
        if (Array.isArray(parsedHistory)) {
          const migratedHistory: FortuneEntry[] = parsedHistory.map(entry => ({
            date: entry.date || 'Unknown Date',
            time: entry.time || 'Unknown Time',
            initiator: entry.initiator || 'Unknown Initiator',
            emotionState: entry.emotionState || 'Unknown Emotion',
            color: entry.color || 'Unknown Color',
            focus: entry.focus || 'Unknown Focus',
            activity: entry.activity || 'Unknown Activity',
            nickname: entry.nickname || 'N/A', // Provide default for nickname if missing
            fortune: entry.fortune || 'No fortune recorded',
          }));
          setFortuneHistory(migratedHistory);
        } else {
            console.warn("Invalid history format in localStorage. Resetting.");
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error("Error loading fortune history from localStorage:", err);
      // Optionally reset history if parsing fails critically
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    // Only save to localStorage if history has been initialized and potentially changed.
    // Avoids writing default empty array on first load if nothing was in localStorage.
    if (fortuneHistory.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEY) !== null) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fortuneHistory));
        } catch (err) {
            console.error("Error saving fortune history to localStorage:", err);
            // Alert user if storage is full, but this is a rare case for simple JSON.
            // alert("Could not save history. Your browser storage might be full.");
        }
    }
  }, [fortuneHistory]);

  const handleSubmitFortuneRequest = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    let currentFortune = '';
    let currentError: string | null = null;
    setFortune('');
    setError(null);

    const combinedInput = `${initiator} ${emotionState}, feeling like the color ${color}. It's mainly about ${focus}. Lately, I've been ${activity}.`;

    try {
      const generatedFortune = await generateFortuneFromAPI(combinedInput);
      setFortune(generatedFortune);
      currentFortune = generatedFortune;
    } catch (err) {
      console.error("Error fetching fortune:", err);
      const errorMessage = err instanceof Error ? `Error: ${err.message}. Ensure your API_KEY is correctly configured.` : 'An unknown error occurred. The digital monk is currently meditating... or the API key is missing.';
      setError(errorMessage);
      currentError = errorMessage;
    } finally {
      setIsLoading(false);
      const newEntry: FortuneEntry = {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        initiator,
        emotionState,
        color,
        focus,
        activity,
        nickname: nickname.trim() || 'Anonymous', // Save trimmed nickname or "Anonymous"
        fortune: currentError ? `ERROR: ${currentError}` : (currentFortune || "No fortune generated (empty API response)"),
      };
      setFortuneHistory(prevHistory => [...prevHistory, newEntry]);
    }
  }, [initiator, emotionState, color, focus, activity, nickname, isLoading]); // Added nickname to dependencies

  const inputBaseClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 placeholder-slate-400";
  const labelBaseClass = "block text-sm font-medium text-sky-200 mb-1";

  const escapeCSVField = (fieldData: string | null | undefined): string => {
    if (fieldData === null || fieldData === undefined) {
      return '""';
    }
    const stringField = String(fieldData);
    const escapedField = stringField.replace(/"/g, '""');
    return `"${escapedField}"`;
  };

  const downloadHistoryAsCSV = () => {
    if (fortuneHistory.length === 0) {
      alert("No fortune history to download yet! Interact with the monk first.");
      return;
    }

    const headers = [
      "Date", "Time", "Nickname",
      "Initiator", "Emotion/State", "Color Metaphor",
      "Main Focus", "Recent Activity",
      "Generated Fortune/Outcome"
    ];

    const csvRows = [
      headers.map(escapeCSVField).join(','), 
      ...fortuneHistory.map(entry => [
        escapeCSVField(entry.date),
        escapeCSVField(entry.time),
        escapeCSVField(entry.nickname), // Added nickname to CSV
        escapeCSVField(entry.initiator),
        escapeCSVField(entry.emotionState),
        escapeCSVField(entry.color),
        escapeCSVField(entry.focus),
        escapeCSVField(entry.activity),
        escapeCSVField(entry.fortune)
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) { 
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "digital_monk_fortunes_history.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("Your browser doesn't support automatic CSV download. Please try a different browser.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-900">
      <div className="bg-slate-800 bg-opacity-70 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.01]">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-kalam">
            Digital Monk's Wisdom
          </h1>
          <p className="text-sky-300 mt-2 text-sm">Peer into the digital ether, and find your fortune by weaving your state of mind.</p>
        </header>

        <main>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="initiator" className={labelBaseClass}>How do you begin?</label>
              <select id="initiator" value={initiator} onChange={(e) => setInitiator(e.target.value)} className={inputBaseClass} disabled={isLoading} aria-label="Sentence starter">
                {initiatorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="emotionState" className={labelBaseClass}>Your primary feeling/state is...</label>
              <select id="emotionState" value={emotionState} onChange={(e) => setEmotionState(e.target.value)} className={inputBaseClass} disabled={isLoading} aria-label="Primary feeling or state">
                {emotionStateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="color" className={labelBaseClass}>This feels like the color...</label>
              <select id="color" value={color} onChange={(e) => setColor(e.target.value)} className={inputBaseClass} disabled={isLoading} aria-label="Metaphorical color association">
                {colorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="focus" className={labelBaseClass}>And it's mainly about...</label>
              <select id="focus" value={focus} onChange={(e) => setFocus(e.target.value)} className={inputBaseClass} disabled={isLoading} aria-label="Main subject or focus">
                {focusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="activity" className={labelBaseClass}>Lately, I've been...</label>
              <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value)} className={inputBaseClass} disabled={isLoading} aria-label="Recent activity or pace">
                {activityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="nickname" className={labelBaseClass}>Nickname (optional):</label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={inputBaseClass}
                placeholder="Your identifier..."
                disabled={isLoading}
                aria-label="Nickname for history entries"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitFortuneRequest}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-900 font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <LoadingIcon className="w-5 h-5 mr-2" />
                Consulting the Oracle...
              </>
            ) : (
              "Unveil My Fortune"
            )}
          </button>

          {error && <ErrorAlert message={error} className="mt-6" />}

          {fortune && !isLoading && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h2 className="text-xl font-semibold text-sky-200 mb-3 text-center font-kalam">Your Fortune:</h2>
              <blockquote className="bg-indigo-900 bg-opacity-50 p-6 rounded-lg border-l-4 border-amber-400 shadow-xl">
                <p className="text-lg italic text-sky-100 leading-relaxed font-kalam">
                  {fortune}
                </p>
              </blockquote>
            </div>
          )}

          {fortuneHistory.length > 0 && ( // Show button even if loading, but it won't do much if history is empty
             <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                <button
                    onClick={downloadHistoryAsCSV}
                    disabled={isLoading && fortuneHistory.length === 0} // Disable if loading AND history is empty, otherwise enable
                    className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 disabled:cursor-not-allowed"
                    aria-label="Download all fortune history as CSV file"
                >
                    Download Full History ({fortuneHistory.length} {fortuneHistory.length === 1 ? 'entry' : 'entries'})
                </button>
            </div>
          )}
        </main>
        <footer className="mt-8 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Digital Monk AI. All wisdom compiled on demand and saved locally in your browser.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
