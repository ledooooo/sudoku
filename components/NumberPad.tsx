import React from 'react';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
}

export const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-9 sm:grid-cols-9 gap-1 sm:gap-2 w-full max-w-md">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="
            flex items-center justify-center
            h-10 sm:h-14 
            rounded-lg sm:rounded-xl 
            bg-indigo-50 
            text-indigo-600 
            text-xl sm:text-2xl font-semibold 
            hover:bg-indigo-100 
            active:bg-indigo-200 
            transition-colors 
            border border-indigo-100
            shadow-sm
          "
        >
          {num}
        </button>
      ))}
    </div>
  );
};
