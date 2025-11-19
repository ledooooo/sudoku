import React from 'react';
import { Undo2, Eraser, Pencil, Lightbulb } from 'lucide-react';

interface GameControlsProps {
  onUndo: () => void;
  onErase: () => void;
  onNoteToggle: () => void;
  onHint: () => void;
  isNoteMode: boolean;
  canUndo: boolean;
  isHintLoading: boolean;
}

const ControlButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}> = ({ icon, label, onClick, isActive, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 w-16 sm:w-20
      ${isActive ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm border border-slate-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
    `}
  >
    <div className={isActive ? 'text-white' : 'text-indigo-600'}>{icon}</div>
    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">{label}</span>
  </button>
);

export const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onErase,
  onNoteToggle,
  onHint,
  isNoteMode,
  canUndo,
  isHintLoading
}) => {
  return (
    <div className="flex justify-between items-center w-full max-w-md gap-2 sm:gap-4 mb-6">
      <ControlButton 
        icon={<Undo2 size={20} />} 
        label="Undo" 
        onClick={onUndo} 
        disabled={!canUndo}
      />
      <ControlButton 
        icon={<Eraser size={20} />} 
        label="Erase" 
        onClick={onErase} 
      />
      <ControlButton 
        icon={<Pencil size={20} />} 
        label={isNoteMode ? "Notes: On" : "Notes: Off"} 
        onClick={onNoteToggle} 
        isActive={isNoteMode}
      />
      <ControlButton 
        icon={<Lightbulb size={20} className={isHintLoading ? "animate-pulse" : ""} />} 
        label="Hint" 
        onClick={onHint} 
        disabled={isHintLoading}
      />
    </div>
  );
};
