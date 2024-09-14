<script setup lang="ts">
import { useStore } from "vuex";
import lottie from "lottie-web";
import racingJson from "~/assets/gif/racing.json";
import { calculatePerformance } from "~/utils";

const store = useStore();

const isPaused = computed(() => store.getters.isPaused);
const isRunning = computed(() => store.getters.isRunning);
const raceSchedule = computed(() => store.getters.raceSchedule);
const horses = computed(() => store.getters.horses);
const results = computed(() => store.getters.results);
const currentRun = computed(() => store.getters.currentRun);
const raceFinished = computed(() => store.getters.raceFinished);

const executeRace = () => store.dispatch("executeRace");
const pauseRace = () => store.commit("pauseRace");
const resumeRace = () => store.commit("resumeRace");
const generateHorses = () => store.dispatch("generateHorses");
const generateSchedule = () => store.dispatch("generateSchedule");
const initStore = () => store.dispatch("init");

const animationContainers = ref([]);
const animationInstances = ref([]);

const createAnimationInstances = () => {
  // reset everything first
  if (animationInstances.value.length > 0) {
    animationInstances.value.forEach((instance) => {
      instance.destroy();
    });
  }

  animationInstances.value = [];

  // destroy all instances
  animationContainers.value.forEach((container) => {
    container.innerHTML = "";
  });

  for (let i = 0; i < 10; i++) {
    const container = animationContainers.value[i];

    const horse = raceSchedule.value[currentRun.value].horses[i];
    container.classList.add("diagonal-split");
    container.style.setProperty("--color1", horse.jockeySilk[0]);
    container.style.setProperty("--color2", horse.jockeySilk[1]);

    container.innerHTML = `<span title="${horse.name}" class="sr-only">${horse.name}</span>`;
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
    const performance = calculatePerformance(
      horse.condition,
      raceSchedule.value[currentRun.value].horses
    );
    const containerWidth = container.parentElement.offsetWidth;
    const horseWidth = container.offsetWidth;
    const distance = containerWidth - horseWidth;
    const targetPosition = (performance / 100) * distance;

    if (isRunning.value) {
      container.style.transition = `transform ${
        raceSchedule.value[currentRun.value].length
      }ms linear`;
      container.style.transform = `translateX(${targetPosition}px) scaleX(-1)`;

      // Set animation speed and play
      animationInstance.setSpeed(performance / 100); // Example: speed based on performance
      animationInstance.play();
    }
  }
};

const updateAnimationInstances = () => {
  const currentResults = results.value[currentRun.value];
  const currentRunSchedule = raceSchedule.value[currentRun.value];

  for (let i = 0; i < 10; i++) {
    const container = animationContainers.value[i];
    container.style.background =
      raceSchedule.value[currentRun.value].horses[i].jockeySilk[0];
    container.innerHTML = raceSchedule.value[currentRun.value].horses[i].name;
  }

  // Move horses based on their performance
  if (currentResults) {
    currentResults.forEach((result, index) => {
      const horseElement = animationContainers.value[index];

      if (horseElement) {
        const containerWidth = horseElement.parentElement.offsetWidth;
        const horseWidth = horseElement.offsetWidth;
        const distance = containerWidth - horseWidth;
        const targetPosition = (result.performance / 100) * distance;

        horseElement.style.transition = `transform ${currentRunSchedule.length}ms linear`;
        horseElement.style.transform = `translateX(${targetPosition}px) scaleX(-1)`;
      }
    });
  }

  if (currentResults) {
    currentResults.forEach((result, index) => {
      const animationInstance = animationInstances.value.find(
        (instance) => instance.id === result.horse.id
      );

      if (animationInstance) {
        animationInstance.setSpeed(result.animationSpeed);
        animationInstance.play();
      }
    });
  }
};

const handleClickRaceGeneration = () => {
  generateSchedule();

  startAnimations();
};

onMounted(() => {
  generateHorses();
});

const resetHorsePositions = () => {
  animationContainers.value.forEach((container) => {
    if (container) {
      container.style.transition = "none";
      container.style.transform = "translateX(0) scaleX(-1)";
    }
  });
};

const startAnimations = () => {
  // Reset horse positions
  resetHorsePositions();

  // Create new animation instances for the current run
  createAnimationInstances();
};

const stopAnimations = () => {
  animationInstances.value.forEach((animationInstance) => {
    if (animationInstance.isLoaded) {
      animationInstance.stop();
    }
  });
};

const pauseAnimations = () => {
  // Allow current animations to finish
  setTimeout(() => {
    resetHorsePositions();
  }, raceSchedule.value[currentRun.value].length);
};

const resumeAnimations = () => {
  animationInstances.value.forEach((animationInstance) => {
    if (animationInstance.isLoaded) {
      animationInstance.play();
    }
  });
};

const handleRaceControl = () => {
  if (isRunning.value && !isPaused.value) {
    pauseRace();
    pauseAnimations();
  } else if (isRunning.value && isPaused.value) {
    resumeRace();
    resumeAnimations();
  } else {
    executeRace();
    startAnimations();
  }
};

watch(
  currentRun,
  (value) => {
    if (value) {
      startAnimations();
    }
  },
  { immediate: true }
);

watch(raceFinished, (value) => {
  if (value) {
    stopAnimations();
    resetHorsePositions();
  }
});
</script>

<template>
  <UContainer class="pb-12 pt-20 relative">
    <header class="fixed top-0 start-0 end-0 px-8 bg-white shadow-md z-20">
      <div class="flex flex-col md:flex-row items-center justify-between py-2">
        <h1 class="text-2xl font-bold">Horse Racing</h1>
        <div class="flex items-center gap-4">
          <UButton
            label="Generate Schedule"
            @click="handleClickRaceGeneration"
          />

          <UButton
            v-if="raceSchedule?.length > 0"
            :label="
              isRunning
                ? isPaused
                  ? 'Resume Race'
                  : 'Pause Race'
                : 'Start Race'
            "
            @click="handleRaceControl"
          />
        </div>
      </div>
    </header>

    <div class="race-track">
      <div v-for="(container, index) in 10" :key="index" class="race-row">
        <div ref="animationContainers" class="animation-container"></div>
      </div>
    </div>

    <!-- <ul>
      <li v-for="(item, index) in results" class="py-2">{{ item }}</li>
    </ul> -->

    <!-- <p>{{ raceSchedule }}</p> -->
  </UContainer>
</template>

<style scoped>
.race-track {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.race-row {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #ccc;
}

.animation-container {
  width: 50px;
  height: 50px;
  position: absolute;
  left: 0;
  transform: scaleX(-1); /* Flip horizontally */
}

.diagonal-split {
  position: relative;
  width: 50px;
  height: 50px;
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
</style>
