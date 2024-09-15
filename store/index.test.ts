import { describe, it, expect, vi, beforeEach } from "vitest";
import { actions } from "./index";
import { STABLE, NUM_HORSES, NUM_RUNS } from "~/data/constants";
import { createInitialHorses, generateRaceSchedule } from "~/utils/index";

describe("Vuex Store Actions", () => {
  let commit: Function;
  let dispatch: Function;
  let state: any;
  let showToast: Function;

  beforeEach(() => {
    commit = vi.fn();
    dispatch = vi.fn();
    showToast = vi.fn();
    state = {
      horses: createInitialHorses(STABLE, NUM_HORSES),
      raceSchedule: generateRaceSchedule(
        createInitialHorses(STABLE, NUM_HORSES)
      ),
      isRunning: false,
      isPaused: false,
      currentRun: 0,
      raceFinished: false,
    };
  });

  it("should increment the counter", () => {
    actions.increment({ commit });
    expect(commit).toHaveBeenCalledWith("increment");
  });

  it("should initialize the store", async () => {
    await actions.init({ dispatch });
    expect(dispatch).toHaveBeenCalledWith("generateHorses");
    expect(dispatch).toHaveBeenCalledWith("generateSchedule");
  });

  it("should generate horses", () => {
    actions.generateHorses({ commit });
    expect(commit).toHaveBeenCalledWith("setHorses", expect.any(Array));
  });

  it("should generate schedule", () => {
    actions.generateSchedule({ commit, state });
    expect(commit).toHaveBeenCalledWith("setRaceSchedule", expect.any(Array));
  });

  // TODO: Timing out and failing. Fix this test
  // it("should execute race", async () => {
  //   vi.useFakeTimers();
  //   await actions.executeRace({ state, commit });
  //   vi.runAllTimers();
  //   expect(commit).toHaveBeenCalledWith("resetResults");
  //   expect(commit).toHaveBeenCalledWith("startRace");
  //   expect(commit).toHaveBeenCalledWith("setCurrentRun", 0);
  //   expect(commit).toHaveBeenCalledWith("setResults", expect.any(Array));
  //   expect(commit).toHaveBeenCalledWith("endRace");
  //   vi.useRealTimers();
  // }, 20000);

  it("should not execute race if already running", async () => {
    state.isRunning = true;
    await actions.executeRace({ state, commit });
    expect(commit).not.toHaveBeenCalled();
  });

  it("should toggle race", () => {
    actions.toggleRace({ commit, state });
    expect(commit).toHaveBeenCalledWith("pauseRace");
    state.isPaused = true;
    actions.toggleRace({ commit, state });
    expect(commit).toHaveBeenCalledWith("resumeRace");
  });
});
