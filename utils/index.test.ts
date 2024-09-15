import { describe, it, expect, vi } from "vitest";
import {
  generateUniqueHorseName,
  generateUniqueCondition,
  generateUniqueSilks,
  createInitialHorses,
  generateRaceSchedule,
  wait,
  calculateAnimationSpeed,
  calculatePerformance,
  runRace,
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
import type { Horse, RaceRun } from "~/types";

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

  it("should ensure each horse in a run is unique", () => {
    const initialHorses: Horse[] = createInitialHorses(STABLE, NUM_HORSES);
    const schedule = generateRaceSchedule(initialHorses);

    // Check that each horse in a run is unique
    schedule.forEach((run) => {
      const horseIds = run.horses.map((horse) => horse.id);
      const uniqueHorseIds = new Set(horseIds);
      expect(uniqueHorseIds.size).toBe(horseIds.length);
    });
  });
});

/** Helper Functions */
describe("Helper Functions", () => {
  vi.useFakeTimers();

  it("wait function resolves after specified time", async () => {
    const ms = 1000;
    const promise = wait(ms);

    vi.advanceTimersByTime(ms);

    await expect(promise).resolves.toBeUndefined();
  });

  it("calculateAnimationSpeed returns correct speed based on condition", () => {
    expect(calculateAnimationSpeed(30)).toBe(0.75);
    expect(calculateAnimationSpeed(60)).toBe(1);
    expect(calculateAnimationSpeed(80)).toBe(1.5);
  });

  it("calculatePerformance returns correct performance based on condition", () => {
    const horses: Horse[] = [
      { id: 1, name: "Horse 1", condition: 80 },
      { id: 2, name: "Horse 2", condition: 60 },
      { id: 3, name: "Horse 3", condition: 100 },
    ];

    expect(calculatePerformance(80, horses)).toBe(80);
    expect(calculatePerformance(60, horses)).toBe(60);
    expect(calculatePerformance(100, horses)).toBe(100);
  });

  it("runRace calculates and sorts race results correctly", async () => {
    const race: RaceRun = {
      length: 100,
      horses: [
        { id: 1, name: "Horse 1", condition: 80 },
        { id: 2, name: "Horse 2", condition: 60 },
        { id: 3, name: "Horse 3", condition: 100 },
      ],
    };

    const results = await runRace(race);

    expect(results).toHaveLength(3);
    expect(results[0].horse.id).toBe(3); // Horse with the best condition
    expect(results[1].horse.id).toBe(1);
    expect(results[2].horse.id).toBe(2);
  });
});
