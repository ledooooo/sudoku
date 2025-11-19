import { GoogleGenAI, Type } from "@google/genai";
import { Grid, HintResponse } from '../types';

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getSudokuHint = async (grid: Grid): Promise<HintResponse | null> => {
  if (!API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  // Convert grid to a simple string representation for the prompt
  // 0 represents empty cells
  const boardString = grid.map(row => row.map(cell => cell.value).join(',')).join('\n');

  const prompt = `
    You are a Sudoku Grandmaster.
    I have a Sudoku puzzle. 0 represents an empty cell.
    Here is the current board state (9x9 grid):
    ${boardString}

    Please identify the NEXT LOGICAL step. Find a cell that can be solved using logic (e.g., Naked Singles, Hidden Singles).
    Return the result in strictly valid JSON format.
    Do not solve the whole board, just give me one number for one specific cell.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                cell: {
                    type: Type.OBJECT,
                    properties: {
                        row: { type: Type.INTEGER, description: "0-indexed row number" },
                        col: { type: Type.INTEGER, description: "0-indexed column number" }
                    },
                    required: ["row", "col"]
                },
                value: { type: Type.INTEGER, description: "The correct number for this cell" },
                explanation: { type: Type.STRING, description: "A short, clear explanation of the logic used (e.g., 'Only place for 5 in this row')." }
            },
            required: ["cell", "value", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const hint: HintResponse = JSON.parse(text);
    return hint;

  } catch (error) {
    console.error("Error fetching hint from Gemini:", error);
    return null;
  }
};
