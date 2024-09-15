<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import lottie from "lottie-web";
import racingJson from "~/assets/gif/racing.json";
import { calculatePerformance, calculateOrdinalText } from "~/utils";
import { NUM_RUNNING_HORSES } from "~/data/constants";

const store = useStore();

/** Store getters */
const isPaused = computed(() => store.getters.isPaused);
const isRunning = computed(() => store.getters.isRunning);
const raceSchedule = computed(() => store.getters.raceSchedule);
const currentRun = computed(() => store.getters.currentRun);
const raceFinished = computed(() => store.getters.raceFinished);

/** Store mutations */
const playAudioTrack = () => store.commit("playAudioTrack");
const pauseAudioTrack = () => store.commit("pauseAudioTrack");
const resetAudioTrack = () => store.commit("resetAudioTrack");

const animationContainers = ref([]);
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
    const horse = raceSchedule.value[currentRun.value].horses[i];

    container.classList.add("diagonal-split");
    container.style.setProperty("--color1", horse.jockeySilk[0]);
    container.style.setProperty("--color2", horse.jockeySilk[1]);
    container.style.transform = `scaleX(-1);`;

    container.innerHTML = `<span title="${horse.name}" class="absolute bottom-full start-[-2rem] text-sm w-[80px] truncate bg-white/75 dark:bg-gray-800/75" style="transform: scaleX(-1);">${horse.name}</span>`;

    const animationInstance = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: racingJson,
    });

    animationInstance.id = horse.id;
    animationInstances.value.push(animationInstance);

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

    container.style.left = "0px";
    container.dataset.targetPosition = targetPosition;
    container.dataset.distance = distance;

    if (isRunning.value && !isPaused.value && !raceFinished.value) {
      playAudioTrack();

      container.style.transition = `left ${
        raceSchedule.value[currentRun.value].length * 2
      }ms linear`;
      container.style.left = `${targetPosition}px`;

      animationInstance.setSpeed(performance / 100);
      animationInstance.play();
    }
  }
};

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
};

// When the current run changes, start the animations to recreate the instance and containers
watch(
  currentRun,
  (value) => {
    if (value) {
      startAnimations();
      resetAudioTrack();

      // if the game is running and not paused, play the audio track
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

/**
 * defineExpose will expose the functions to the parent component so they an be called from there
 */
defineExpose({
  startAnimations,
  stopAnimations,
  pauseAnimations,
  resumeAnimations,
  resetHorsePositions,
  createAnimationInstances,
});
</script>

<template>
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

    <div
      class="w-full flex items-center font-bold w-full text-orange-600 dark:text-orange-500 bottom-0 translate-y-1/2"
    >
      <div
        class="px-4 py-2 0 text-center flex-1 flex justify-center items-center ps-[28px]"
      >
        <transition
          appear
          enter-active-class="duration-300 ease-out"
          enter-from-class="transform opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="transform opacity-0"
        >
          <p v-if="raceSchedule[currentRun] && !raceFinished">
            <span>{{ `${calculateOrdinalText(currentRun + 1)} Lap` }}</span>
            -
            <span>{{ raceSchedule[currentRun].length + "m" }}</span>
          </p></transition
        >
      </div>

      <div class="py-2 0 text-end translate-x-1/2">
        <p>
          <span>{{ "FINISH" }}</span>
        </p>
      </div>
    </div>
  </RacetrackWrapper>
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
  height: 70px;
  border: 1px solid #ccc;
  border-right: 2px solid rgb(249 115 22);
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
