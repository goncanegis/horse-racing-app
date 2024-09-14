import type { Horse } from "../types";
import {
  STABLE,
  MIN_CONDITION,
  MAX_CONDITION,
  JOCKEY_SILKS,
  NUM_RUNS,
  NUM_RUNNING_HORSES,
  LEN_RUNS,
} from "~/data/constants";

/**
 * Helper functions to create initial horses
 */

/**
 * Horse name generator that will select a unique name from the STABLE array
 * @param createdIndexes - array of indexes that have already been used
 * @returns - a unique horse name
 */
export const generateUniqueHorseName = (
  namesArray: string[],
  createdIndexes: number[]
): { name: string; index: number } => {
  const index = Math.floor(Math.random() * namesArray.length);
  if (createdIndexes.includes(index)) {
    return generateUniqueHorseName(namesArray, createdIndexes);
  }
  createdIndexes.push(index);
  return { name: namesArray[index], index };
};

/**
 *
 * @param createdConditions - array of conditions that have already been used
 * @returns a unique condition
 */
export const generateUniqueCondition = (
  createdConditions: number[]
): number => {
  const condition =
    Math.floor(Math.random() * (MAX_CONDITION - MIN_CONDITION + 1)) +
    MIN_CONDITION;
  if (createdConditions.includes(condition)) {
    return generateUniqueCondition(createdConditions);
  }
  createdConditions.push(condition);
  return condition;
};

export const generateUniqueColors = (
  silkArr: string[][],
  createdColors: string[][]
): string[] => {
  const colors = silkArr[Math.floor(Math.random() * silkArr.length)];
  for (const colorPair of createdColors) {
    if (colorPair[0] === colors[0] && colorPair[1] === colors[1]) {
      return generateUniqueColors(silkArr, createdColors);
    }
  }
  createdColors.push(colors);
  return colors;
};

/**
 * Helper function that will take an array of data and remove duplicate values.
 * It checks if the data is an array of single items or arrays and handles them accordingly.
 */
const cleanData = <T>(data: T[]): T[] => {
  if (Array.isArray(data[0])) {
    // Handle array of arrays
    const newSet = new Set(data.map((item) => JSON.stringify(item)));
    return Array.from(newSet).map((item) => JSON.parse(item));
  } else {
    // Handle array of single items
    const newSet = new Set(data);
    return Array.from(newSet);
  }
};

/**
 *
 * @param count - number of horses to create
 * @returns an array of horses
 */
export const createInitialHorses = (
  stableArr: string[],
  count: number
): Horse[] => {
  // clean up the data
  const stable = cleanData(stableArr);

  const silks = cleanData(JOCKEY_SILKS);

  const usedNameIndexes: number[] = [];
  const usedConditions: number[] = [];
  const usedColors: string[][] = [];

  const horses: Horse[] = [];

  for (let i = 0; i < count; i++) {
    const { name, index } = generateUniqueHorseName(stable, usedNameIndexes);

    const condition = generateUniqueCondition(usedConditions);

    const colors = generateUniqueColors(silks, usedColors);

    horses.push({
      name,
      id: i,
      color: colors,
      condition,
    });

    usedNameIndexes.push(index);
    usedConditions.push(condition);
    usedColors.push(colors);
  }

  return horses;
};

/**
 * Function that will generate a racing schedule of 6 runs with 10 random horses each.
 * Horses will be randomly picked from the initial horses array.
 * The generated array will be an array of objects containing horses and the length of the run.
 */
export const generateRaceSchedule = (
  horses: Horse[]
): { horses: Horse[]; length: number }[] => {
  const schedule: { horses: Horse[]; length: number }[] = [];
  for (let i = 0; i < NUM_RUNS; i++) {
    const run: Horse[] = [];
    for (let j = 0; j < NUM_RUNNING_HORSES; j++) {
      const index = Math.floor(Math.random() * horses.length);
      run.push(horses[index]);
    }
    schedule.push({ horses: run, length: LEN_RUNS[i] });
  }
  return schedule;
};
