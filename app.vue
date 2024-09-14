<script setup lang="ts">
import { useStore } from "vuex";

const store = useStore();

const horses = computed(() => store.state.horses);
const raceSchedule = computed(() => store.state.raceSchedule);

const generateSchedule = () => store.dispatch("generateSchedule");

const initStore = () => store.dispatch("generateHorses");

const startPause = () => store.dispatch("startPause");

onMounted(initStore);
</script>

<template>
  <UContainer>
    <header class="w-full">
      <div class="flex flex-col md:flex-row items-center justify-between py-2">
        <h1 class="text-2xl font-bold">Horse Racing</h1>
        <div class="flex items-center gap-4">
          <UButton @click="generateSchedule">Generate program</UButton>
          <UButton @click="startPause">Start / pause</UButton>
        </div>
      </div>
    </header>
    <p>{{ horses }}</p>
    <br /><br />
    <p>{{ raceSchedule }}</p>
  </UContainer>
</template>
