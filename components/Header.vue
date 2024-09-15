<script setup lang="ts">
import type { RaceRun } from "~/types";
import Logo from "~/assets/images/logo.svg?component";
const colorMode = useColorMode();

interface Props {
  isRunning: boolean;
  isPaused: boolean;
  raceSchedule: RaceRun[];
  raceFinished: boolean;
}

defineProps<Props>();

defineEmits([
  "handleClickRaceGeneration",
  "handleRaceControl",
  "resetRacetrack",
]);

/** Color mode  */
const colorModeIcon = computed(() => {
  return colorMode.value === "system"
    ? "i-openmoji:overlapping-white-and-black-squares"
    : colorMode.value === "dark"
    ? "i-heroicons-moon-20-solid"
    : "i-heroicons-sun-20-solid";
});

const availableModes = ["system", "dark", "light"];
const switchColorMode = () => {
  const currentIndex = availableModes.indexOf(colorMode.value);
  const nextIndex = (currentIndex + 1) % availableModes.length;
  colorMode.value = availableModes[nextIndex];
};
</script>

<template>
  <header
    class="fixed top-0 start-0 end-0 px-8 shadow-md z-20 bg-white dark:bg-gray-900"
  >
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 py-2"
    >
      <div class="flex items-center gap-2">
        <Logo filled class="w-[48px] h-[48px]" />
        <h1 class="text-2xl font-bold">Horse Racing</h1>
      </div>

      <div class="flex items-center gap-4">
        <ClientOnly>
          <UButton
            :icon="colorModeIcon"
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="switchColorMode"
          />
          <template #fallback>
            <div class="w-8 h-8" />
          </template>
        </ClientOnly>
        <UButton
          label="Generate Schedule"
          @click="$emit('handleClickRaceGeneration')"
        />

        <UButton
          v-if="raceSchedule?.length > 0 && !raceFinished"
          :label="
            isRunning ? (isPaused ? 'Resume Race' : 'Pause Race') : 'Start Race'
          "
          @click="$emit('handleRaceControl')"
        />

        <UButton
          v-if="raceFinished"
          label="Reset"
          @click="$emit('resetRacetrack')"
        />
      </div>
    </div>
  </header>
</template>

<style scoped></style>
