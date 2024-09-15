<script setup lang="ts">
import type { Horse } from "~/types";
interface Props {
  horses: Horse[];
}

defineProps<Props>();
</script>

<template>
  <section class="">
    <h2 class="text-2xl mb-4 font-bold">Horse List</h2>
    <div class="grid-container">
      <div class="grid-header">
        <div class="grid-cell font-bold">Name</div>
        <div class="grid-cell font-bold">Condition</div>
        <div class="grid-cell font-bold">Color</div>
      </div>
      <div class="grid-body">
        <div v-for="(horse, index) in horses" :key="index" class="grid-row">
          <div class="grid-cell font-bold">{{ horse.name }}</div>
          <div class="grid-cell">{{ horse.condition }}</div>
          <div class="grid-cell">
            <div class="flex items-center gap-2">
              <div
                class="w-5 h-5 rounded-sm"
                :style="{ background: horse.color.value }"
              ></div>
              <span>{{ horse.color.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
}

.grid-header {
  display: contents;
}

.grid-body {
  display: contents;
}

.grid-row {
  display: contents;
}

.grid-cell {
  border: 1px solid #ccc;
  padding: 0.5rem;
}
</style>
