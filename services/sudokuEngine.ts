import { GRID_SIZE, BOX_SIZE, DIFFICULTY_CONFIG } from '../constants';
import { Grid, CellData, Difficulty } from '../types';

// Helper to create an empty grid
const createEmptyGrid = (): number[][] => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

// Check if safe to put number in cell
const isSafe = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check row and col
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - (row % BOX_SIZE);
  const startCol = col - (col % BOX_SIZE);
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
};

// Backtracking solver to fill the grid
const fillGrid = (grid: number[][]): boolean => {
  let row = -1;
  let col = -1;
  let isEmpty = false;

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }

  if (!isEmpty) return true; // Solved

  // Try random numbers 1-9
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

  for (const num of numbers) {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (fillGrid(grid)) return true;
      grid[row][col] = 0;
    }
  }

  return false;
};

// Remove elements to create puzzle
const removeElements = (grid: number[][], count: number): number[][] => {
  const puzzle = grid.map(row => [...row]);
  let attempts = count;

  while (attempts > 0) {
    let row = Math.floor(Math.random() * GRID_SIZE);
    let col = Math.floor(Math.random() * GRID_SIZE);

    while (puzzle[row][col] === 0) {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    }

    puzzle[row][col] = 0;
    attempts--;
  }
  return puzzle;
};

// Initialize diagonal boxes (independent) to ensure randomness before solving
const fillDiagonal = (grid: number[][]) => {
  for (let i = 0; i < GRID_SIZE; i = i + BOX_SIZE) {
    fillBox(grid, i, i);
  }
};

const fillBox = (grid: number[][], row: number, col: number) => {
  let num: number;
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      do {
        num = Math.floor(Math.random() * GRID_SIZE) + 1;
      } while (!isSafeBox(grid, row, col, num));
      grid[row + i][col + j] = num;
    }
  }
};

const isSafeBox = (grid: number[][], rowStart: number, colStart: number, num: number) => {
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[rowStart + i][colStart + j] === num) {
        return false;
      }
    }
  }
  return true;
};

export const generateNewGame = (difficulty: Difficulty): Grid => {
  const solvedGrid = createEmptyGrid();
  fillDiagonal(solvedGrid);
  fillGrid(solvedGrid); // Solves the rest

  const removedCount = DIFFICULTY_CONFIG[difficulty].removedCount;
  const puzzleGrid = removeElements(solvedGrid, removedCount);

  // Convert to Grid object structure
  return puzzleGrid.map((row, rIndex) =>
    row.map((val, cIndex) => ({
      row: rIndex,
      col: cIndex,
      value: val,
      solutionValue: solvedGrid[rIndex][cIndex],
      isFixed: val !== 0,
      notes: [],
      isError: false,
    }))
  );
};

export const validateBoard = (grid: Grid): boolean => {
    // Basic validation checking for duplicates in rows/cols/boxes
    // Returns true if no immediate conflicts found
    for (let i = 0; i < GRID_SIZE; i++) {
        const rowSet = new Set();
        const colSet = new Set();
        const boxSet = new Set();
        for (let j = 0; j < GRID_SIZE; j++) {
            // Row Check
            const rVal = grid[i][j].value;
            if (rVal !== 0) {
                if (rowSet.has(rVal)) return false;
                rowSet.add(rVal);
            }

            // Col Check
            const cVal = grid[j][i].value;
            if (cVal !== 0) {
                if (colSet.has(cVal)) return false;
                colSet.add(cVal);
            }

            // Box Check
            const r = 3 * Math.floor(i / 3) + Math.floor(j / 3);
            const c = 3 * (i % 3) + (j % 3);
            const bVal = grid[r][c].value;
             if (bVal !== 0) {
                if (boxSet.has(bVal)) return false;
                boxSet.add(bVal);
            }
        }
    }
    return true;
};

export const isGridComplete = (grid: Grid): boolean => {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j].value !== grid[i][j].solutionValue) {
        return false;
      }
    }
  }
  return true;
};