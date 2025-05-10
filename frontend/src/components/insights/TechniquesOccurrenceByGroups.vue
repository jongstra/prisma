<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTopTechniquesByGroup() {
  const sortedTechniques = [...store.techniquesOccurrences].sort((a, b) => b.group_occurrence - a.group_occurrence);
  return sortedTechniques;
}
</script>

<template>
  <div class="technique-visualization">
    <div class="title">
     Techniques
      <span v-if="getTopTechniquesByGroup().length >= 15"> (Top 15)</span>
      - Occurrence by Groups
    </div>
    <hr>
    <div v-for="(technique, index) in getTopTechniquesByGroup().slice(0, 15)" :key="index" class="technique-row">
      <div class="technique-name">{{ technique.name }}</div>
      <div class="bar-container">
        <div 
          class="bar red-bar" 
          :style="{ width: technique.group_occurrence * 3 + 'px' }"
        ></div>
        <span class="item-count">{{ technique.group_occurrence }}</span>
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

.red-bar {
  background-color: FireBrick;
}

.item-count {
  margin-left: 4px;
  font-size: 12px;
}
</style>
