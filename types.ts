export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface CellData {
  row: number;
  col: number;
  value: number; // 0 for empty
  solutionValue: number;
  isFixed: boolean; // True if part of initial puzzle
  notes: number[]; // For pencil marks
  isError: boolean; // True if conflicts with row/col/box
}

export type Grid = CellData[][];

export interface GameState {
  grid: Grid;
  difficulty: Difficulty;
  selectedCell: { row: number; col: number } | null;
  mistakes: number;
  timer: number;
  isGameOver: boolean;
  isWon: boolean;
  isNoteMode: boolean;
  history: Grid[]; // For undo
}

export interface HintResponse {
  cell: { row: number; col: number };
  value: number;
  explanation: string;
}
