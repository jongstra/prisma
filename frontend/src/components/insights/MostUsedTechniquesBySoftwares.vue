<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTopTechniquesBySoftware() {
  const sortedTechniques = [...store.sortedTechniques].sort((a, b) => b.software_occurrence - a.software_occurrence);
  return sortedTechniques.slice(0, 15);
}
</script>

<template>
  <div class="technique-visualization">
    <div class="title">
      Top Techniques by Software Occurrence
      <span v-if="getTopTechniquesBySoftware().length >= 15"> - Top 15</span>
    </div>
    <hr>
    <div v-for="(technique, index) in getTopTechniquesBySoftware()" :key="index" class="technique-row">
      <div class="technique-name">{{ technique.name }}</div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: technique.software_occurrence * 0.55 + 'px' }"
        ></div>
        <span class="technique-count">{{ technique.software_occurrence }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.technique-visualization {
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-radius: 5px;
  width: 450px;
  margin-top: 10px;
  margin-right: 10px;
}

.title {
  text-align: center;
  margin: 5px;
  font-size: 16px;
  font-weight: bold;
}

.technique-row {
  display: flex;
  align-items: center;
  margin: 5px;
}

.technique-name {
  min-width: 170px;
  text-align: right;
  padding-right: 10px;
  font-size: 13px;
}

.bar-container {
  display: flex;
  align-items: center;
  position: relative;
  height: 14px;
  width: 100%;
}

.bar {
  height: 14px;
}

.blue-bar {
  background-color: Olive;
}

.technique-count {
  margin-left: 8px;
  font-size: 12px;
}
</style>
