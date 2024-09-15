<script setup lang="ts"></script>

<template>
  <div class="race-track flex-1">
    <h2 class="text-2xl mb-4 font-bold">Racetrack</h2>
    <slot />
  </div>
</template>

<style scoped>
.race-track {
  display: flex;
  flex-direction: column;
}
</style>
