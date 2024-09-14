// create vuex store
import { createStore } from "vuex";
import type { Horse, RaceRun } from "~/types";
import { STABLE, NUM_HORSES, NUM_RUNS } from "~/data/constants";
import {
  createInitialHorses,
  generateRaceSchedule,
  wait,
  runRace,
  calculateAnimationSpeed,
  calculatePerformance,
} from "~/utils/index";
import raceSound from "~/assets/sfx/racing-sound.mp4";

interface State {
  horses: Horse[];
  raceSchedule: RaceRun[];
  counter: number;
  results: any[];
  isPaused: boolean;
  isRunning: boolean;
  currentRun: number;
  raceFinished: boolean;
}

/**
 * State
 */
const state: State = {
  horses: [] as Horse[],
  raceSchedule: [] as RaceRun[],
  counter: 0,
  results: [],
  isPaused: false,
  isRunning: false,
  currentRun: 0,
  raceFinished: false,
};

/**
 * Getters
 */
const getters = {
  horses: (state: State) => state.horses,
  raceSchedule: (state: State) => state.raceSchedule,
  counter(state: State): number {
    return state.counter;
  },
  results(state: State): any[] {
    return state.results;
  },
  isPaused(state: State): boolean {
    return state.isPaused;
  },
  isRunning(state: State): boolean {
    return state.isRunning;
  },
  currentRun(state: State): number {
    return state.currentRun;
  },
  raceFinished(state: State): boolean {
    return state.raceFinished;
  },
};

/**
 * Mutations
 */
const mutations = {
  increment(state: State) {
    state.counter++;
  },

  setHorses(state: State, horses: Horse[]) {
    state.horses = horses;
  },

  setRaceSchedule(state: State, raceSchedule: RaceRun[]) {
    state.raceSchedule = raceSchedule;
  },

  setResults(state: State, results: any[]) {
    state.results = [...state.results, results];
  },

  pauseRace(state: State) {
    state.isPaused = true;
  },
  resumeRace(state: State) {
    state.isPaused = false;
  },

  startRace(state: State) {
    state.isRunning = true;
  },

  endRace(state: State) {
    state.isRunning = false;
  },

  resetResults(state: State) {
    state.results = [];
  },

  setCurrentRun(state: State, currentRun: number) {
    state.currentRun = currentRun;
  },

  setRaceFinished(state: State, raceFinished: boolean) {
    state.raceFinished = raceFinished;
  },

  incrementCurrentRun(state: State) {
    state.currentRun++;
  },
};

/**
 * Actions
 */
const actions = {
  increment({ commit }: { commit: Function }) {
    commit("increment");
  },

  async init({ dispatch }: { dispatch: Function }) {
    await dispatch("generateHorses");
    await dispatch("generateSchedule");
  },

  generateHorses({ commit }: { commit: Function }) {
    const horses = createInitialHorses(STABLE, NUM_HORSES);
    commit("setHorses", horses);
  },

  generateSchedule({ commit, state }: { commit: Function; state: State }) {
    const schedule = generateRaceSchedule(state.horses);
    commit("setRaceSchedule", schedule);
  },

  async executeRace({ state, commit }: { state: State; commit: Function }) {
    if (state.isRunning) {
      return;
    }

    if (!state.raceSchedule || state.raceSchedule.length === 0) {
      showToast({
        title: "Please create a race schedule first!",
        type: "error",
      });
      return;
    }

    // Reset results and start running the program
    commit("resetResults");
    commit("startRace");
    commit("setCurrentRun", 0);

    // Helper function to wait for a specified amount of time
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Iterate over the race schedule
    for (const race of state.raceSchedule) {
      // Check if the race is paused. If it is, check every 100ms
      while (state.isPaused) {
        await wait(100);
      }

      const audio = new Audio(raceSound);
      console.log("audio", audio);
      audio.play();

      // Calculate the results by using horses' condition and race length
      const raceResults = race.horses.map((horse) => {
        const performance = calculatePerformance(horse.condition, state.horses);
        // const performance = (horse.condition / bestCondition) * 100; // Normalize performance to 100
        const animationSpeed = calculateAnimationSpeed(horse.condition);
        return { horse, performance, animationSpeed };
      });

      // Sort the results by performance in descending order
      raceResults.sort((a, b) => b.performance - a.performance);

      // Wait for the race length before starting the next race so we can show animations in the ui
      if (state.currentRun !== NUM_RUNS - 1) {
        await wait(race.length);
      }

      // Commit the results to the state
      commit("setResults", raceResults);

      // Increment the current run
      if (state.currentRun < state.raceSchedule.length - 1) {
        commit("setCurrentRun", state.currentRun + 1);
      }

      // if we have reached the end of the runs, set raceFinished to true
      if (state.currentRun === state.raceSchedule.length - 1) {
        commit("setRaceFinished", true);
      }
    }

    // End the race
    commit("endRace");
  },

  toggleRace({
    commit,
    state,
  }: {
    state: State;
    dispatch: Function;
    commit: Function;
  }) {
    if (state.isPaused) {
      commit("resumeRace");
    } else {
      commit("pauseRace");
    }
  },
};

/**
 * Create store
 */
const store = createStore({
  state,
  getters,
  mutations,
  actions,
});

export default store;
