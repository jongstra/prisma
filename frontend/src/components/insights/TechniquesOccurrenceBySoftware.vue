<script setup lang="ts">
import { computed } from 'vue';
import { barWidth } from '@/components/common/barWidth';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTopTechniquesBySoftware() {
  const sortedTechniques = [...store.techniquesOccurrences].sort((a, b) => b.software_occurrence - a.software_occurrence);
  return sortedTechniques;
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTopTechniquesBySoftware().map((x) => x.software_occurrence)));
</script>

<template>
  <div class="technique-visualization">
    <div class="title">
      Techniques
      <span v-if="getTopTechniquesBySoftware().length >= 15"> (Top 15)</span>
      - Occurrence by Software
    </div>
    <hr>
    <div v-for="(technique, index) in getTopTechniquesBySoftware().slice(0, 15)" :key="index" class="technique-row">
      <div class="technique-name">{{ technique.name }}</div>
      <div class="bar-container">
        <div 
          class="bar green-bar" 
          :style="{ width: barWidth(technique.software_occurrence, maxCount) }"
        ></div>
        <span class="item-count">{{ technique.software_occurrence }}</span>
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

.green-bar {
  background-color: Olive;
}

.item-count {
  margin-left: 4px;
  font-size: 12px;
}
</style>
