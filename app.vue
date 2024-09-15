<script setup lang="ts">
import { useStore } from "vuex";
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

const animationContainers = ref([]);
const horseInfoContainers = ref([]);
const animationInstances = ref([]);

/**
 * Create animation instances for each horse
 */
const createAnimationInstances = () => {
  // reset everything first
  // destroy all instances
  if (animationInstances.value.length > 0) {
    animationInstances.value.forEach((instance) => {
      instance.destroy();
    });
  }

  // clear the array
  animationInstances.value = [];

  // clear the containers
  animationContainers.value.forEach((container) => {
    container.innerHTML = "";
  });

  // create 10 animation instances and colored containers
  for (let i = 0; i < NUM_RUNNING_HORSES; i++) {
    const container = animationContainers.value[i];
    const horseNameContainer = horseInfoContainers.value[i];
    const horse = raceSchedule.value[currentRun.value].horses[i];

    container.classList.add("diagonal-split");
    container.style.setProperty("--color1", horse.jockeySilk[0]);
    container.style.setProperty("--color2", horse.jockeySilk[1]);
    container.style.transform = `scaleX(-1);`;

    container.innerHTML = `<span title="${horse.name}" class="absolute bottom-full start-[-2rem] text-sm w-[80px] truncate" style="transform: scaleX(-1);">${horse.name}</span>`;

    // Create a container for the horse name
    //  horseNameContainer.innerHTML = `<span class="text-sm z-[-1]">${horse.name}</span>`;

    const animationInstance = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: racingJson,
    });

    animationInstance.id = horse.id;
    animationInstances.value.push(animationInstance);

    // Calculate performance using the existing function
    // this will be used to determine the speed of the animation
    // and how much distance the horse will cover in the run's duration
    const performance = calculatePerformance(
      horse.condition,
      raceSchedule.value[currentRun.value].horses
    );
    const containerWidth = container.parentElement.offsetWidth;
    const horseWidth = container.offsetWidth;
    const distance = containerWidth - horseWidth;
    const targetPosition = Math.abs(
      (performance / 100) * distance - 40
    ).toFixed(2);

    // Set initial position
    container.style.left = "0px";

    // Store target position as a data attribute
    container.dataset.targetPosition = targetPosition;
    container.dataset.distance = distance;

    // Move the container to the target position if the race is running
    if (isRunning.value && !isPaused.value && !raceFinished.value) {
      playAudioTrack();

      container.style.transition = `left ${
        raceSchedule.value[currentRun.value].length * 2
      }ms linear`;
      container.style.left = `${targetPosition}px`;

      // Set animation speed and play
      animationInstance.setSpeed(performance / 100); // Example: speed based on performance
      animationInstance.play();
    }
  }
};

// Initialize the store and create the animation instances
const handleClickRaceGeneration = () => {
  generateSchedule();

  startAnimations();
};

// before app mount, generate the horse list so we can show the horses
onBeforeMount(() => {
  generateHorses();
});

// Bring containers to their starting position
const resetHorsePositions = () => {
  animationContainers.value.forEach((container) => {
    if (container) {
      container.style.transition = "none";
      container.style.left = "0px";
    }
  });
};

// Start animations
// Reset horse positions
// Create new animation instances for the current run
const startAnimations = () => {
  resetHorsePositions();

  createAnimationInstances();
};

// Stop all animations
const stopAnimations = () => {
  animationInstances.value.forEach((animationInstance) => {
    if (animationInstance.isLoaded) {
      animationInstance.stop();
    }
  });
};

// Pause all animations
// Stop all transitions
// Freeze the current position of the horses
const pauseAnimations = () => {
  animationInstances.value.forEach((animationInstance) => {
    if (animationInstance.isLoaded) {
      animationInstance.pause();
    }
  });

  animationContainers.value.forEach((container) => {
    const computedStyle = window.getComputedStyle(container);
    const currentLeft = parseFloat(computedStyle.left);
    container.style.transition = "none";
    container.style.left = `${currentLeft}px`;
  });

  pauseAudioTrack();
};

// Resume all animations
// Set the transition duration based on the remaining distance
// Move the horses to their target position from their current position
const resumeAnimations = () => {
  animationInstances.value.forEach((animationInstance) => {
    if (animationInstance.isLoaded) {
      animationInstance.play();
    }
  });

  animationContainers.value.forEach((container) => {
    const distance = parseFloat(container.dataset.distance);
    const targetPosition = parseFloat(container.dataset.targetPosition);
    const computedStyle = window.getComputedStyle(container);
    const currentLeft = parseFloat(computedStyle.left);
    const remainingDistance = targetPosition - currentLeft;
    const remainingTime =
      (remainingDistance / distance) *
      raceSchedule.value[currentRun.value].length *
      2;
    container.style.transition = `left ${remainingTime}ms linear`;
    container.style.left = `${targetPosition}px`;
  });

  //  playAudioTrack();
};

// If game has already started and is not paused, pause the game and animations
// If game has already started and is paused, resume the game and animations
// If game has not started, start the game and animations
const handleRaceControl = () => {
  if (isRunning.value && !isPaused.value) {
    // pause store
    pauseRace();

    // pause ui
    pauseAnimations();
  } else if (isRunning.value && isPaused.value) {
    // resume store
    resumeRace();

    // resume ui
    resumeAnimations();
  } else {
    // start store action
    executeRace();

    // start ui
    startAnimations();
  }
};

// When the current run changes, start the animations to recreate the instance and containers
watch(
  currentRun,
  (value) => {
    if (value) {
      startAnimations();
      resetAudioTrack();

      if (isRunning.value && !isPaused.value && !raceFinished.value) {
        playAudioTrack();
      }
    }
  },
  { immediate: true }
);

// When all the runs are finished, stop all animations and reset the horse positions
watch(raceFinished, (value) => {
  if (value) {
    stopAnimations();
    resetHorsePositions();
  }
});

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
      <RacetrackWrapper>
        <div
          v-for="(container, index) in NUM_RUNNING_HORSES"
          :key="index"
          class="race-row"
        >
          <div class="track-number-container">
            <span class="track-number">{{ index + 1 }}</span>
          </div>
          <div ref="animationContainers" class="animation-container"></div>
        </div>
      </RacetrackWrapper>

      <!-- Program -->
      <Program :raceSchedule="raceSchedule" />

      <!-- Results -->
      <Result :results="results" :raceSchedule="raceSchedule" />
    </PageWrapper>
  </div>
</template>

<style scoped>
.diagonal-split {
  position: relative;
  width: 50px;
  height: 50px;
  transform: scaleX(-1);
}

.diagonal-split::before,
.diagonal-split::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: -1;
}

.diagonal-split::before {
  background: var(--color1);
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.diagonal-split::after {
  background: var(--color2);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.race-row {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: 77px;
  border: 1px solid #ccc;
  gap: 4px;
}

.track-number-container {
  background: green;
  color: #fff;
  height: 100%;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-number {
  transform: rotate(-90deg);
  font-weight: bold;
}
</style>
