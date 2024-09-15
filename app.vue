<script setup lang="ts">
import { useStore } from "vuex";
import { ref, computed, onBeforeMount, watch } from "vue";
import lottie from "lottie-web";
import racingJson from "~/assets/gif/racing.json";
import { calculatePerformance, calculateOrdinalText } from "~/utils";
import { NUM_RUNS, NUM_RUNNING_HORSES } from "~/data/constants";

const store = useStore();

/** Store getters */
const isPaused = computed(() => store.getters.isPaused);
const isRunning = computed(() => store.getters.isRunning);
const raceSchedule = computed(() => store.getters.raceSchedule);
const horses = computed(() => store.getters.horses);
const results = computed(() => store.getters.results);
const currentRun = computed(() => store.getters.currentRun);
const raceFinished = computed(() => store.getters.raceFinished);

/** Store actions */
const executeRace = () => store.dispatch("executeRace");
const generateHorses = () => store.dispatch("generateHorses");
const generateSchedule = () => store.dispatch("generateSchedule");
const initStore = () => store.dispatch("init");
const resetRacetrack = () => store.dispatch("resetRacetrack");

/** Store mutations */
const pauseRace = () => store.commit("pauseRace");
const resumeRace = () => store.commit("resumeRace");
const playAudioTrack = () => store.commit("playAudioTrack");
const pauseAudioTrack = () => store.commit("pauseAudioTrack");
const resetAudioTrack = () => store.commit("resetAudioTrack");

// Initial container and instance values
const animationContainers = ref([]);
const horseInfoContainers = ref([]);
const animationInstances = ref([]);

// Racetrack ref. Will be used to access its methods
const racetrackRef = ref(null);

// Initialize the store and create the animation instances
const handleClickRaceGeneration = () => {
  generateSchedule();
  racetrackRef.value?.startAnimations();
};

// before app mount, generate the horse list so we can show the horses
onBeforeMount(() => {
  generateHorses();
});

// If game has already started and is not paused, pause the game and animations
// If game has already started and is paused, resume the game and animations
// If game has not started, start the game and animations
const handleRaceControl = () => {
  if (isRunning.value && !isPaused.value) {
    // pause store
    pauseRace();

    // pause ui
    racetrackRef.value?.pauseAnimations();
  } else if (isRunning.value && isPaused.value) {
    // resume store
    resumeRace();

    // resume ui
    racetrackRef.value?.resumeAnimations();
  } else {
    // start store action
    executeRace();

    // start ui
    racetrackRef.value?.startAnimations();
  }
};

// Watcher that will scroll to the end of the results container when the results change
watch(results, () => {
  setTimeout(() => {
    const resultsContainer = document.querySelector(".results-container");
    resultsContainer.scrollTop = resultsContainer.scrollHeight;
  }, 200);
});

// App meta data
useHead({
  charset: "utf-8",
  viewport: "width=device-width, initial-scale=1",
  title: "Horse Racing App",
  meta: [
    {
      hid: "description",
      name: "description",
      content: "Horse Racing App",
    },
    {
      hid: "description",
      name: "description",
      content: "At koşar baht kazanır",
    },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>

<template>
  <div class="pb-12 pt-24 px-6 2xl:px-12 relative">
    <Header
      :is-running="isRunning"
      :is-paused="isPaused"
      :raceSchedule="raceSchedule"
      :race-finished="raceFinished"
      @handleClickRaceGeneration="handleClickRaceGeneration"
      @handleRaceControl="handleRaceControl"
      @resetRacetrack="resetRacetrack"
    />

    <PageWrapper>
      <!-- List of 20 horses -->
      <HorseList :horses="horses" />

      <!-- Racetrack -->
      <Racetrack ref="racetrackRef" />

      <!-- Program -->
      <Program :raceSchedule="raceSchedule" />

      <!-- Results -->
      <Result :results="results" :raceSchedule="raceSchedule" />
    </PageWrapper>
  </div>
</template>

<style scoped>
/* Add any additional styles if needed */
</style>
