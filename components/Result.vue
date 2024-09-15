<script setup lang="ts">
import type { RaceResult, RaceRun } from "~/types";
import { calculateOrdinalText } from "~/utils";
interface Props {
  results: RaceResult[][];
  raceSchedule: RaceRun[];
}

defineProps<Props>();
</script>

<template>
  <section class="">
    <h2 class="text-2xl mb-4 font-bold">Results</h2>
    <div class="program-container results-container">
      <div
        v-for="(result, resultIndex) in results"
        :key="resultIndex"
        class="grid"
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
          <div v-if="result" class="grid">
            <!-- Run Info Row -->
            <div
              class="px-4 py-2 font-bold w-full bg-orange-600 text-white text-center"
            >
              <p>
                <span>{{
                  `${calculateOrdinalText(resultIndex + 1)} Lap`
                }}</span>
                -
                <span>{{ raceSchedule[resultIndex].length + "m" }}</span>
              </p>
            </div>

            <!-- Horse List Row -->
            <div
              v-for="(item, index) in result"
              class="grid grid-cols-[60px_1fr]"
            >
              <div class="border px-4 py-2 text-center">
                {{ index + 1 }}
              </div>
              <div class="border px-4 py-2">
                <ul>
                  <li>{{ item.horse.name }}</li>
                </ul>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.program-container {
  height: auto;
  max-height: calc(100vh - 180px);
  overflow-y: scroll;
  display: grid;
  min-width: 328px;
}
</style>
