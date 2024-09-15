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
  audioTrack: HTMLAudioElement;
}

/**
 * State
 */
export const state: State = {
  horses: [] as Horse[],
  raceSchedule: [] as RaceRun[],
  counter: 0,
  results: [],
  isPaused: false,
  isRunning: false,
  currentRun: 0,
  raceFinished: false,
  audioTrack: new Audio(raceSound),
};

/**
 * Getters
 */
export const getters = {
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
  audioTrack(state: State): HTMLAudioElement {
    return state.audioTrack;
  },
};

/**
 * Mutations
 */
export const mutations = {
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

  setAudioTrack(state: State, audioTrack: HTMLAudioElement) {
    state.audioTrack = audioTrack;
  },

  playAudioTrack(state: State) {
    state.audioTrack.play();
  },

  pauseAudioTrack(state: State) {
    state.audioTrack.pause();
  },

  resetAudioTrack(state: State) {
    state.audioTrack.currentTime = 0;
  },
};

/**
 * Actions
 */
export const actions = {
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

    try {
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

        // Calculate the results by using horses' condition and race length
        const raceResults = race.horses.map((horse) => {
          const performance = calculatePerformance(
            horse.condition,
            state.horses
          );
          const animationSpeed = calculateAnimationSpeed(horse.condition);
          return { horse, performance, animationSpeed };
        });

        // Sort the results by performance in descending order
        raceResults.sort((a, b) => b.performance - a.performance);

        // Wait for the race length before starting the next race so we can show animations in the UI
        let elapsed = 0;
        const interval = 100;
        while (elapsed < race.length * 2) {
          if (state.isPaused) {
            await wait(100);
            continue;
          }
          await wait(interval);
          elapsed += interval;
        }

        // Commit the results to the state after the waiting period
        commit("setResults", raceResults);

        // Increment the current run
        if (state.currentRun < state.raceSchedule.length - 1) {
          commit("setCurrentRun", state.currentRun + 1);
        }

        // // If we have reached the end of the runs, set raceFinished to true
        // if (state.currentRun === state.raceSchedule.length - 1) {
        //   commit("setRaceFinished", true);
        //   commit("pauseAudioTrack");
        //   commit("resetAudioTrack");
        //   commit("endRace");
        // }
      }

      commit("setRaceFinished", true);
      commit("pauseAudioTrack");
      commit("resetAudioTrack");
      commit("endRace");
    } catch (error) {
      console.error(error);
    }
  },

  resetRacetrack({ commit }: { commit: Function }) {
    commit("setRaceFinished", false);
    commit("setCurrentRun", 0);
    commit("resetResults");
    commit("resetAudioTrack");
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
