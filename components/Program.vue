<script setup lang="ts">
import type { RaceRun } from "~/types";
import { calculateOrdinalText } from "~/utils";
interface Props {
  raceSchedule: RaceRun[];
}

defineProps<Props>();
</script>

<template>
  <section class="">
    <h2 class="text-2xl mb-4 font-bold">Program</h2>
    <div class="program-container">
      <div v-for="(run, runIndex) in raceSchedule" :key="runIndex" class="grid">
        <transition
          appear
          enter-active-class="duration-300 ease-out"
          enter-from-class="transform opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="transform opacity-0"
        >
          <div v-if="run">
            <!-- Run Info Row -->
            <div
              class="px-4 py-2 font-bold w-full bg-orange-600 text-white text-center"
            >
              <p>
                <span>{{ `${calculateOrdinalText(runIndex + 1)} Lap` }}</span>
                -
                <span>{{ run.length + "m" }}</span>
              </p>
            </div>

            <!-- Horse List Row -->
            <div
              v-for="(horse, horseIndex) in run.horses"
              :key="horseIndex"
              class="grid grid-cols-[60px_1fr]"
            >
              <div class="border px-4 py-2 text-center">
                {{ horseIndex + 1 }}
              </div>
              <div class="border px-4 py-2">
                <ul>
                  <li>{{ horse.name }}</li>
                </ul>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
