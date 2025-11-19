import React from 'react';
import { Difficulty } from '../types';
import { Clock, AlertCircle } from 'lucide-react';

interface HeaderProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  timer: number;
  mistakes: number;
  maxMistakes: number;
  onNewGame: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  setDifficulty,
  timer,
  mistakes,
  maxMistakes,
  onNewGame
}) => {
  return (
    <header className="w-full max-w-md flex flex-col gap-4 mb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">MindFlow Sudoku</h1>
        <button 
            onClick={onNewGame}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md"
        >
            New Game
        </button>
      </div>

      <div className="flex items-center justify-between text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Difficulty</span>
            <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="bg-transparent font-semibold text-indigo-600 focus:outline-none cursor-pointer"
            >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
            </select>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <AlertCircle size={16} className={mistakes >= maxMistakes ? "text-red-500" : "text-slate-400"} />
                <span className={`font-mono font-medium ${mistakes > 0 ? 'text-red-500' : 'text-slate-600'}`}>
                    {mistakes}/{maxMistakes}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-slate-400" />
                <span className="font-mono font-medium text-slate-600">{formatTime(timer)}</span>
            </div>
        </div>
      </div>
    </header>
  );
};
