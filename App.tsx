import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Cell } from './components/Cell';
import { GameControls } from './components/GameControls';
import { NumberPad } from './components/NumberPad';
import { Grid, Difficulty, CellData, HintResponse } from './types';
import { generateNewGame, isGridComplete } from './services/sudokuEngine';
import { getSudokuHint } from './services/geminiService';
import { MAX_MISTAKES } from './constants';

const App: React.FC = () => {
  // State
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [grid, setGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [history, setHistory] = useState<Grid[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ text: string, type: 'info' | 'error' | 'success' } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Initialize Game
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    const newGrid = generateNewGame(diff);
    setGrid(newGrid);
    setHistory([]);
    setMistakes(0);
    setTimer(0);
    setIsGameOver(false);
    setIsWon(false);
    setSelectedCell(null);
    setAiMessage(null);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  }, [difficulty]);

  // Initial load
  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  // Change Difficulty
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    startNewGame(newDifficulty);
  };

  // Handle Cell Click
  const handleCellClick = (row: number, col: number) => {
    if (isGameOver || isWon) return;
    setSelectedCell({ row, col });
  };

  // Update Grid Helper
  const updateGrid = (newGrid: Grid, addToHistory: boolean = true) => {
    if (addToHistory) {
      setHistory((prev) => [...prev.slice(-20), grid]); // Keep last 20 moves
    }
    setGrid(newGrid);
  };

  // Handle Input (Number or Note)
  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || isGameOver || isWon) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];

    if (cell.isFixed) return; // Cannot edit fixed cells

    // Clone grid for immutability
    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    const currentCell = newGrid[row][col];

    if (isNoteMode) {
      // Toggle note
      if (currentCell.notes.includes(num)) {
        currentCell.notes = currentCell.notes.filter((n) => n !== num);
      } else {
        currentCell.notes = [...currentCell.notes, num].sort();
      }
      // If value was present, clear it when adding note? Usually standard Sudoku apps allow notes on top of incorrect values, or clear value if note added. 
      // Let's keep value if it exists, notes are usually shown only if value is 0.
      if (currentCell.value !== 0) {
          // If user is typing notes on a filled cell, usually we don't do anything or we clear value.
          // Let's deciding: typing a note doesn't clear value, but UI hides notes if value > 0.
      }
      updateGrid(newGrid);
    } else {
      // Enter value
      if (currentCell.value === num) return; // No change

      // Check correctness immediately
      const isCorrect = num === currentCell.solutionValue;
      
      if (isCorrect) {
        currentCell.value = num;
        currentCell.isError = false;
        currentCell.notes = []; // Clear notes on correct entry
        
        // Also clear this number from notes in same row/col/box
        // Row & Col
        for(let i=0; i<9; i++) {
            newGrid[row][i].notes = newGrid[row][i].notes.filter(n => n !== num);
            newGrid[i][col].notes = newGrid[i][col].notes.filter(n => n !== num);
        }
        // Box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for(let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                newGrid[startRow + i][startCol + j].notes = newGrid[startRow + i][startCol + j].notes.filter(n => n !== num);
            }
        }

        updateGrid(newGrid);

        // Check Win
        if (isGridComplete(newGrid)) {
            setIsWon(true);
            if (timerRef.current) clearInterval(timerRef.current);
            setAiMessage({ text: "Congratulations! You solved it!", type: 'success' });
        }
      } else {
        // Incorrect
        setMistakes((m) => {
            const newM = m + 1;
            if (newM >= MAX_MISTAKES) {
                setIsGameOver(true);
                if (timerRef.current) clearInterval(timerRef.current);
                setAiMessage({ text: "Game Over! Too many mistakes.", type: 'error' });
            }
            return newM;
        });
        
        // Temporarily show error state or just wrong number
        // Standard behavior: Fill it, mark as error.
        currentCell.value = num;
        currentCell.isError = true;
        updateGrid(newGrid);
      }
    }
  }, [grid, isNoteMode, selectedCell, isGameOver, isWon]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isGameOver || isWon) return;

        // Numbers
        if (e.key >= '1' && e.key <= '9') {
            handleNumberInput(parseInt(e.key));
            return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            handleErase();
            return;
        }

        // Navigation
        if (!selectedCell) return;
        let { row, col } = selectedCell;

        if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') col = Math.min(8, col + 1);

        if (row !== selectedCell.row || col !== selectedCell.col) {
            setSelectedCell({ row, col });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleNumberInput, isGameOver, isWon]);


  const handleUndo = () => {
    if (history.length === 0 || isGameOver || isWon) return;
    const previousGrid = history[history.length - 1];
    setGrid(previousGrid);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleErase = () => {
    if (!selectedCell || isGameOver || isWon) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isFixed) return;

    const newGrid = grid.map(r => r.map(c => ({...c})));
    newGrid[row][col].value = 0;
    newGrid[row][col].isError = false;
    newGrid[row][col].notes = [];
    updateGrid(newGrid);
  };

  const handleHint = async () => {
    if (isHintLoading || isGameOver || isWon) return;
    setIsHintLoading(true);
    setAiMessage({ text: "Consulting Gemini AI...", type: 'info' });

    const hintData = await getSudokuHint(grid);
    
    setIsHintLoading(false);

    if (hintData) {
        const { cell, value, explanation } = hintData;
        
        // Highlight the cell
        setSelectedCell({ row: cell.row, col: cell.col });

        // Show message
        setAiMessage({ text: explanation, type: 'info' });

        // Optionally auto-fill? No, let the user fill it to learn.
        // But we can add it as a "pencil mark" or just highlight it.
        // Let's add it to notes temporarily to help visually.
        const newGrid = grid.map(r => r.map(c => ({...c})));
        if (!newGrid[cell.row][cell.col].notes.includes(value)) {
            newGrid[cell.row][cell.col].notes.push(value);
            updateGrid(newGrid, false);
        }
    } else {
        setAiMessage({ text: "Couldn't generate a hint. Please check your API Key or network.", type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6">
      
      <Header 
        difficulty={difficulty} 
        setDifficulty={handleDifficultyChange} 
        timer={timer}
        mistakes={mistakes}
        maxMistakes={MAX_MISTAKES}
        onNewGame={() => startNewGame(difficulty)}
      />

      {/* AI Message Banner */}
      {aiMessage && (
        <div className={`
            mb-4 w-full max-w-md p-3 rounded-lg text-sm font-medium flex items-center justify-between animate-fade-in
            ${aiMessage.type === 'error' ? 'bg-red-100 text-red-700' : 
              aiMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
              'bg-indigo-100 text-indigo-800'}
        `}>
            <span>{aiMessage.text}</span>
            <button onClick={() => setAiMessage(null)} className="ml-2 opacity-50 hover:opacity-100 font-bold">×</button>
        </div>
      )}

      <div className="relative bg-slate-800 p-1 sm:p-2 rounded-lg shadow-2xl mb-6 select-none">
        <div className="grid grid-cols-9 bg-slate-300 border-2 border-slate-800 gap-[1px]">
          {grid.map((row, rIndex) => (
            row.map((cellData, cIndex) => (
              <Cell
                key={`${rIndex}-${cIndex}`}
                data={cellData}
                isSelected={selectedCell?.row === rIndex && selectedCell?.col === cIndex}
                isRelated={selectedCell ? (selectedCell.row === rIndex || selectedCell.col === cIndex || (Math.floor(selectedCell.row/3) === Math.floor(rIndex/3) && Math.floor(selectedCell.col/3) === Math.floor(cIndex/3))) : false}
                isSameValue={selectedCell && grid[selectedCell.row][selectedCell.col].value !== 0 ? grid[selectedCell.row][selectedCell.col].value === cellData.value : false}
                onClick={handleCellClick}
              />
            ))
          ))}
        </div>
        
        {/* Overlay for Game Over / Win */}
        {(isGameOver || isWon) && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 text-white p-6 text-center">
                <h2 className="text-3xl font-bold mb-2">{isWon ? "Solved!" : "Game Over"}</h2>
                <p className="mb-6 text-slate-300">{isWon ? `Time: ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2,'0')}` : "Don't give up!"}</p>
                <button 
                    onClick={() => startNewGame()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold shadow-lg transition-transform active:scale-95"
                >
                    Play Again
                </button>
            </div>
        )}
      </div>

      <GameControls 
        onUndo={handleUndo}
        onErase={handleErase}
        onNoteToggle={() => setIsNoteMode(!isNoteMode)}
        onHint={handleHint}
        isNoteMode={isNoteMode}
        canUndo={history.length > 0}
        isHintLoading={isHintLoading}
      />

      <NumberPad onNumberClick={handleNumberInput} />

    </div>
  );
};

export default App;