import type { Horse, RaceRun } from "../types";
import {
  HORSE_COLORS,
  MIN_CONDITION,
  MAX_CONDITION,
  JOCKEY_SILKS,
  NUM_RUNS,
  NUM_RUNNING_HORSES,
  LEN_RUNS,
} from "~/data/constants";

type ColorArray = string[] | string[][];

/**
 * Helper functions to create initial horses
 */

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

export const generateUniqueSilks = (
  silkArr: string[][],
  createdColors: string[][]
): string[] => {
  const colors = silkArr[Math.floor(Math.random() * silkArr.length)];
  for (const colorPair of createdColors) {
    if (colorPair[0] === colors[0] && colorPair[1] === colors[1]) {
      return generateUniqueSilks(silkArr, createdColors);
    }
  }
  createdColors.push(colors);
  return colors;
};

export const generateUniqueHorseColor = (
  createdColors: { label: string; value: string }[]
): { label: string; value: string } => {
  const color = HORSE_COLORS[Math.floor(Math.random() * HORSE_COLORS.length)];
  if (createdColors.some((c) => c.value === color.value)) {
    return generateUniqueHorseColor(createdColors);
  }
  createdColors.push(color);
  return color;
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
  const usedSilkColors: string[][] = [];
  const usedHorseColors: { label: string; value: string }[] = [];

  const horses: Horse[] = [];

  for (let i = 0; i < count; i++) {
    const { name, index } = generateUniqueHorseName(stable, usedNameIndexes);

    const condition = generateUniqueCondition(usedConditions);

    const silkColors = generateUniqueSilks(silks, usedSilkColors);

    const color = generateUniqueHorseColor(usedHorseColors);

    horses.push({
      name,
      id: i,
      jockeySilk: silkColors,
      condition,
      color,
    });

    usedNameIndexes.push(index);
    usedConditions.push(condition);
    usedSilkColors.push(silkColors);
    usedHorseColors.push(color);
  }

  return horses;
};

/**
 * --------------
 * Racing Schedule
 * --------------
 *  */

/**
 * Function that will generate a racing schedule of 6 runs with 10 random horses each.
 * Horses will be randomly picked from the initial horses array.
 * The generated array will be an array of objects containing horses and the length of the run.
 */
export const generateRaceSchedule = (horses: Horse[]): RaceRun[] => {
  const schedule: { horses: Horse[]; length: number }[] = [];
  const availableHorses = [...horses]; // Create a copy of the horses array to keep track of available horses

  for (let i = 0; i < NUM_RUNS; i++) {
    const run: Horse[] = [];
    const usedIndices = new Set<number>(); // Keep track of used indices for the current run

    for (let j = 0; j < NUM_RUNNING_HORSES; j++) {
      let index;
      do {
        index = Math.floor(Math.random() * availableHorses.length);
      } while (usedIndices.has(index)); // Ensure the horse is unique for the current run

      usedIndices.add(index);
      run.push(availableHorses[index]);
    }

    schedule.push({ horses: run, length: LEN_RUNS[i] });
  }

  return schedule;
};

/**
 * --------------
 * Races and Results
 * --------------
 *  */

/**
 * Helper function to wait for a specified amount of time
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Start a race of 6 runs and return the results
 */
export const runRace = async (race: RaceRun) => {
  // Calculate the results by using horses' condition and race length
  const raceResults = race.horses.map((horse) => {
    const performance = horse.condition / race.length;
    const animationSpeed = calculateAnimationSpeed(horse.condition);
    return { horse, performance, animationSpeed };
  });

  // Sort the results by performance in descending order
  raceResults.sort((a, b) => b.performance - a.performance);

  return raceResults;
};

/**
 * Helper function to calculate the animation speed based on the horse's condition
 */
export const calculateAnimationSpeed = (condition: number) => {
  if (condition <= 50) {
    return 0.75;
  }

  if (condition > 50 && condition <= 75) {
    return 1;
  }

  return 1.5;
};

/**
 * Helper function to calculate the performance based on the horse's condition
 */
export const calculatePerformance = (condition: number, allHorses: Horse[]) => {
  const bestCondition = Math.max(...allHorses.map((horse) => horse.condition));

  const performance = (condition / bestCondition) * 100;

  return performance;
};
