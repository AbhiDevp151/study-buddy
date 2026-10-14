import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Flag, RotateCcw, BookOpen } from 'lucide-react';

export default function FocusView({ notes, tasks, onShowToast }) {
  const [studyTopic, setStudyTopic] = useState('');
  const [linkedItemId, setLinkedItemId] = useState('');
  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' | 'pomodoro'
  const [pomodoroPhase, setPomodoroPhase] = useState('work'); // 'work' | 'break'
  const [pomodoroDurationMs, setPomodoroDurationMs] = useState(25 * 60 * 1000);
  const [dailyFocusMs, setDailyFocusMs] = useState(45 * 60 * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState([]);

  const playGentleChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.95);
    } catch (e) {
      // Ignore if autoplay blocked
    }
  };

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      const startTime = Date.now() - elapsedMs;
      interval = setInterval(() => {
        const nextElapsed = Date.now() - startTime;
        if (timerMode === 'pomodoro' && nextElapsed >= pomodoroDurationMs) {
          setIsRunning(false);
          setElapsedMs(0);
          setDailyFocusMs((prev) => prev + pomodoroDurationMs);
          playGentleChime();
          const completedTopic = studyTopic.trim() || (pomodoroPhase === 'work' ? '25m Pomodoro Focus' : '5m Rest Break');
          setLaps((prev) => [
            {
              number: prev.length + 1,
              topic: `${completedTopic} (${pomodoroPhase === 'work' ? '25m Focus' : '5m Break'})`,
              splitMs: pomodoroDurationMs,
              totalMs: pomodoroDurationMs,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev
          ]);
          onShowToast(pomodoroPhase === 'work' ? '25m Focus session complete! Time for a 5m break.' : 'Break finished! Ready for your next focus block.');
        } else {
          setElapsedMs(nextElapsed);
        }
      }, 30);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMode, pomodoroDurationMs, pomodoroPhase, studyTopic]);

  const formatStopwatch = (ms) => {
    const safeMs = Math.max(0, ms);
    const totalSeconds = Math.floor(safeMs / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const centiseconds = String(Math.floor((safeMs % 1000) / 10)).padStart(2, '0');
    return { main: `${hours}:${minutes}:${seconds}`, sub: `.${centiseconds}` };
  };

  const handleRecordLap = () => {
    if (!isRunning && elapsedMs === 0) return;
    const prevTotal = laps.length > 0 ? laps[0].totalMs : 0;
    const lapSplit = elapsedMs > prevTotal ? elapsedMs - prevTotal : elapsedMs;
    const newLap = {
      number: laps.length + 1,
      topic: studyTopic.trim() || `Study Interval #${laps.length + 1}`,
      splitMs: lapSplit,
      totalMs: elapsedMs,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLaps([newLap, ...laps]);
    setDailyFocusMs((prev) => prev + lapSplit);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const displayMs = timerMode === 'stopwatch' ? elapsedMs : Math.max(0, pomodoroDurationMs - elapsedMs);
  const timeParts = formatStopwatch(displayMs);
  const dailyGoalMs = 2 * 60 * 60 * 1000;
  const dailyProgressPct = Math.min(100, Math.round(((dailyFocusMs + (isRunning ? elapsedMs : 0)) / dailyGoalMs) * 100));

  return (
    <div className="flex-1 p-8 sm:p-12 max-w-5xl overflow-y-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-editorial text-3xl text-[#0E2344]">Focus Stopwatch</h1>
          <p className="text-sm text-[#636E7E] mt-1">Time your deep-work study sessions and log laps between topics.</p>
        </div>

        <div className="inline-flex items-center bg-[#EFECE4] p-1 rounded-xl border border-[#E5E0D5] self-start">
          <button
            onClick={() => {
              setIsRunning(false);
              setElapsedMs(0);
              setTimerMode('stopwatch');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              timerMode === 'stopwatch' ? 'bg-[#0E2344] text-white shadow-2xs' : 'text-[#4B5563] hover:text-[#0E2344]'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setElapsedMs(0);
              setTimerMode('pomodoro');
              setPomodoroPhase('work');
              setPomodoroDurationMs(25 * 60 * 1000);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              timerMode === 'pomodoro' ? 'bg-[#0E2344] text-white shadow-2xs' : 'text-[#4B5563] hover:text-[#0E2344]'
            }`}
          >
            Pomodoro (25/5)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAE5DA] px-5 py-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
          <span className="text-xs font-medium text-[#0E2344]">
            Today's Deep Work: <strong className="font-semibold">{Math.floor((dailyFocusMs + (isRunning ? elapsedMs : 0)) / 60000)} mins</strong> of 120m daily goal
          </span>
        </div>
        <div className="w-full sm:w-56 h-2 rounded-full bg-[#F2EFE8] overflow-hidden">
          <div className="h-full bg-[#0E2344] transition-all duration-300 rounded-full" style={{ width: `${dailyProgressPct}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAE5DA] shadow-2xs p-8 sm:p-12 flex flex-col items-center text-center mb-8">
        {timerMode === 'pomodoro' && (
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => {
                setIsRunning(false);
                setElapsedMs(0);
                setPomodoroPhase('work');
                setPomodoroDurationMs(25 * 60 * 1000);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                pomodoroPhase === 'work' ? 'bg-[#F7EBC8] text-[#0E2344] border border-[#EBD9A7]' : 'text-[#636E7E] hover:bg-[#F3EFE6]'
              }`}
            >
              25m Focus Block
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setElapsedMs(0);
                setPomodoroPhase('break');
                setPomodoroDurationMs(5 * 60 * 1000);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                pomodoroPhase === 'break' ? 'bg-[#F7EBC8] text-[#0E2344] border border-[#EBD9A7]' : 'text-[#636E7E] hover:bg-[#F3EFE6]'
              }`}
            >
              5m Rest Break
            </button>
          </div>
        )}

        <div className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-2.5 mb-8">
          <input
            type="text"
            value={studyTopic}
            onChange={(e) => setStudyTopic(e.target.value)}
            placeholder="What are you studying? (optional)"
            className="w-full flex-1 px-4 py-2.5 rounded-xl border border-[#E5E0D5] text-center sm:text-left text-sm text-[#0E2344] placeholder-[#7B8696] focus:outline-none focus:border-[#0E2344]"
          />

          <select
            value={linkedItemId}
            onChange={(e) => setLinkedItemId(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5E0D5] text-xs font-medium text-[#0E2344] focus:outline-none focus:border-[#0E2344] cursor-pointer"
          >
            <option value="">Link to Note / Task...</option>
            <optgroup label="Study Notes">
              {notes.map((n) => (
                <option key={n.id} value={`note:${n.id}`}>📖 {n.title || 'Untitled Note'}</option>
              ))}
            </optgroup>
            {tasks.length > 0 && (
              <optgroup label="Scheduled Tasks">
                {tasks.map((t) => (
                  <option key={t.id} value={`task:${t.id}`}>📅 {t.title}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="font-serif-editorial text-[#0E2344] select-none my-2 flex items-baseline justify-center">
          <span className="text-6xl sm:text-7xl md:text-[84px] leading-none tracking-tight">{timeParts.main}</span>
          <span className="text-2xl sm:text-3xl text-[#4A5B75] ml-1">{timeParts.sub}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="bg-[#0E2344] hover:bg-[#16315C] text-white text-sm font-medium px-8 py-3 rounded-xl inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            {isRunning ? <><Pause className="w-4 h-4"/><span>Pause</span></> : <><Play className="w-4 h-4"/><span>Start</span></>}
          </button>

          <button
            onClick={handleRecordLap}
            disabled={!isRunning && elapsedMs === 0}
            className={`px-7 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition ${
              isRunning || elapsedMs > 0 ? 'bg-[#F2EFE8] hover:bg-[#E7E2D6] text-[#0E2344] cursor-pointer' : 'bg-[#F4F2EC] text-[#A2AAB8] cursor-not-allowed'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Lap</span>
          </button>

          <button
            onClick={handleResetTimer}
            className="px-5 py-3 rounded-xl text-sm font-medium text-[#0E2344] hover:bg-[#F2EFE8] inline-flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {laps.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-[#DFD9CC] bg-[#FAF8F4] py-14 px-6 flex flex-col items-center justify-center text-center">
          <Clock className="w-9 h-9 text-[#B5BCC6] stroke-[1.7] mb-3" />
          <p className="text-sm text-[#636E7E]">Press Start to begin your focus session.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAE5DA] p-6 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE4]">
            <h3 className="font-serif-editorial text-lg text-[#0E2344]">Recorded Study Laps</h3>
            <span className="text-xs text-[#6E7785]">{laps.length} intervals logged</span>
          </div>
          <div className="divide-y divide-[#F3EFE6]">
            {laps.map((lap) => {
              const splitFormatted = formatStopwatch(lap.splitMs);
              const totalFormatted = formatStopwatch(lap.totalMs);
              return (
                <div key={lap.number} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#F7EBC8] text-[#0E2344] font-medium text-xs flex items-center justify-center">
                      #{lap.number}
                    </span>
                    <div>
                      <p className="font-medium text-[#0E2344]">{lap.topic}</p>
                      <p className="text-xs text-[#7B8696]">{lap.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs sm:text-sm">
                    <span className="text-[#0E2344] font-semibold">+{splitFormatted.main}{splitFormatted.sub}</span>
                    <span className="text-[#8C96A6] ml-3">({totalFormatted.main})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}