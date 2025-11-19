import React from 'react';
import { CellData } from '../types';

interface CellProps {
  data: CellData;
  isSelected: boolean;
  isRelated: boolean; // Same row, col, or box
  isSameValue: boolean; // Has the same value as selected cell
  onClick: (row: number, col: number) => void;
}

export const Cell: React.FC<CellProps> = ({ data, isSelected, isRelated, isSameValue, onClick }) => {
  const { row, col, value, isFixed, notes, isError } = data;

  // Determine borders for 3x3 boxes
  const borderBottom = (row + 1) % 3 === 0 && row !== 8 ? 'border-b-2 border-slate-800' : 'border-b border-slate-300';
  const borderRight = (col + 1) % 3 === 0 && col !== 8 ? 'border-r-2 border-slate-800' : 'border-r border-slate-300';
  const borderTop = row === 0 ? 'border-t-2 border-slate-800' : '';
  const borderLeft = col === 0 ? 'border-l-2 border-slate-800' : '';
  
  // Determine background color
  let bgColor = 'bg-white';
  if (isError) bgColor = 'bg-red-100 text-red-600';
  else if (isSelected) bgColor = 'bg-indigo-500 text-white';
  else if (isSameValue && value !== 0) bgColor = 'bg-indigo-200';
  else if (isRelated) bgColor = 'bg-slate-100';
  
  // Text styling
  const textColor = isSelected ? 'text-white' : isError ? 'text-red-600' : isFixed ? 'text-slate-900 font-bold' : 'text-indigo-600 font-medium';
  const cursor = 'cursor-pointer';

  return (
    <div
      className={`
        relative flex items-center justify-center w-full h-full aspect-square text-xl sm:text-2xl select-none transition-colors duration-75
        ${borderBottom} ${borderRight} ${borderTop} ${borderLeft}
        ${bgColor} ${textColor} ${cursor}
      `}
      onClick={() => onClick(row, col)}
      role="gridcell"
      aria-selected={isSelected}
    >
      {value !== 0 ? (
        value
      ) : (
        <div className="grid grid-cols-3 gap-[1px] w-full h-full p-[2px] pointer-events-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div key={num} className="flex items-center justify-center">
              <span className={`text-[8px] sm:text-[10px] leading-none font-normal ${notes.includes(num) ? 'text-slate-500' : 'invisible'}`}>
                {num}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
