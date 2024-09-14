import { describe, it, expect } from "vitest";
import {
  generateUniqueHorseName,
  generateUniqueCondition,
  generateUniqueSilks,
  createInitialHorses,
  generateRaceSchedule,
} from "./index";
import {
  STABLE,
  MIN_CONDITION,
  MAX_CONDITION,
  JOCKEY_SILKS,
  NUM_HORSES,
  NUM_RUNS,
  NUM_RUNNING_HORSES,
  LEN_RUNS,
} from "~/data/constants";
import type { Horse } from "~/types";

/** Horses */
describe("generateUniqueHorseName", () => {
  it("should generate a unique horse name", () => {
    const createdIndexes: number[] = [];
    const { name, index } = generateUniqueHorseName(STABLE, createdIndexes);
    expect(STABLE).toContain(name);
    expect(createdIndexes).toContain(index);
  });

  it("should not generate duplicate horse names", () => {
    const createdIndexes: number[] = [];
    const { name: name1, index: index1 } = generateUniqueHorseName(
      STABLE,
      createdIndexes
    );
    const { name: name2, index: index2 } = generateUniqueHorseName(
      STABLE,
      createdIndexes
    );
    expect(name1).not.toBe(name2);
    expect(index1).not.toBe(index2);
  });
});

describe("generateUniqueCondition", () => {
  it("should generate a unique condition", () => {
    const createdConditions: number[] = [];
    const condition = generateUniqueCondition(createdConditions);
    expect(condition).toBeGreaterThanOrEqual(MIN_CONDITION);
    expect(condition).toBeLessThanOrEqual(MAX_CONDITION);
    expect(createdConditions).toContain(condition);
  });

  it("should not generate duplicate conditions", () => {
    const createdConditions: number[] = [];
    const condition1 = generateUniqueCondition(createdConditions);
    const condition2 = generateUniqueCondition(createdConditions);
    expect(condition1).not.toBe(condition2);
  });
});

describe("generateUniqueSilks", () => {
  it("should generate a unique color pair", () => {
    const createdColors: string[][] = [];
    const colors = generateUniqueSilks(JOCKEY_SILKS, createdColors);
    expect(JOCKEY_SILKS).toContainEqual(colors);
    expect(createdColors).toContainEqual(colors);
  });

  it("should not generate duplicate color pairs", () => {
    const createdColors: string[][] = [];
    const colors1 = generateUniqueSilks(JOCKEY_SILKS, createdColors);
    const colors2 = generateUniqueSilks(JOCKEY_SILKS, createdColors);
    expect(colors1).not.toEqual(colors2);
  });
});

describe("createInitialHorses", () => {
  it("should create the correct number of horses", () => {
    const count = 5;
    const horses = createInitialHorses(STABLE, count);
    expect(horses.length).toBe(count);
  });

  it("should create horses with unique properties", () => {
    const count = 5;
    const horses = createInitialHorses(STABLE, count);
    const names = horses.map((horse) => horse.name);
    const ids = horses.map((horse) => horse.id);
    const conditions = horses.map((horse) => horse.condition);
    const colors = horses.map((horse) => horse.jockeySilk);

    expect(new Set(names).size).toBe(count);
    expect(new Set(ids).size).toBe(count);
    expect(new Set(conditions).size).toBe(count);
    expect(new Set(colors.map(JSON.stringify)).size).toBe(count);
  });

  it("should create 20 horses with unique properties", () => {
    const count = NUM_HORSES;
    const horses = createInitialHorses(STABLE, count);

    const names = horses.map((horse) => horse.name);
    const ids = horses.map((horse) => horse.id);
    const conditions = horses.map((horse) => horse.condition);
    const colors = horses.map((horse) => horse.jockeySilk);

    expect(horses.length).toBe(count);
    expect(new Set(names).size).toBe(count);
    expect(new Set(ids).size).toBe(count);
    expect(new Set(conditions).size).toBe(count);
    expect(new Set(colors.map(JSON.stringify)).size).toBe(count);
  });
});

/**
 * Race Schedule
 */
describe("generateRaceSchedule", () => {
  it("should generate a schedule with the correct number of runs and horses", () => {
    const initialHorses: Horse[] = createInitialHorses(STABLE, NUM_HORSES);
    const schedule = generateRaceSchedule(initialHorses);

    // Check the number of runs
    expect(schedule.length).toBe(NUM_RUNS);

    // Check the number of horses in each run and the length of each run
    schedule.forEach((run, index) => {
      expect(run.horses.length).toBe(NUM_RUNNING_HORSES);
      expect(run.length).toBe(LEN_RUNS[index]);
    });
  });

  it("should only include horses from the initial horses array", () => {
    const initialHorses: Horse[] = createInitialHorses(STABLE, NUM_HORSES);
    const schedule = generateRaceSchedule(initialHorses);

    // Check that all horses in the schedule are from the initial horses array
    schedule.forEach((run) => {
      run.horses.forEach((horse) => {
        expect(initialHorses).toContain(horse);
      });
    });
  });

  it("should handle cases where the number of initial horses is less than the number of running horses", () => {
    const initialHorses: Horse[] = createInitialHorses(STABLE, 5); // Create 5 initial horses
    const schedule = generateRaceSchedule(initialHorses);

    // Check the number of runs
    expect(schedule.length).toBe(NUM_RUNS);

    // Check the number of horses in each run and the length of each run
    schedule.forEach((run, index) => {
      expect(run.horses.length).toBe(NUM_RUNNING_HORSES);
      expect(run.length).toBe(LEN_RUNS[index]);
    });

    // Check that all horses in the schedule are from the initial horses array
    schedule.forEach((run) => {
      run.horses.forEach((horse) => {
        expect(initialHorses).toContain(horse);
      });
    });
  });
});
