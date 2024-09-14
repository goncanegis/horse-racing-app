// create vuex store
import { createStore } from "vuex";
import type { Horse, RaceRun } from "~/types";
import { STABLE, NUM_HORSES } from "~/data/constants";
import { createInitialHorses, generateRaceSchedule } from "~/utils/index";

interface State {
  horses: Horse[];
  raceSchedule: RaceRun[];
  counter: number;
}

/**
 * State
 */
const state: State = {
  horses: [] as Horse[],
  raceSchedule: [] as RaceRun[],
  counter: 0,
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
