<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Software {
  name: string;
  technique_count: number;
  subtechnique_count: number;
}

function getTechniqueCountPerSoftware(): Software[] {
  let softwares;

  if (store.domain === 'enterprise-attack') {
    softwares = store.enterprise?.softwares;
  } else if (store.domain === 'mobile-attack') {
    softwares = store.mobile?.softwares;
  } else if (store.domain === 'ics-attack') {
    softwares = store.ics?.softwares;
  }

  // Check if softwares is defined and is an array
  if (!Array.isArray(softwares)) {
    return [];
  }

  // Return the top 15 softwares (they are pre-sorted in Python on all_technique_count). Remove any softwares with a 0 all_technique_count.
  return softwares
    .filter((software) => software.all_technique_count > 0)
    .slice(0, 15)
    .map((software) => ({
      name: software.name,
      technique_count: software.technique_count,
      subtechnique_count: software.subtechnique_count,
    }));
}
</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Software
      <span v-if="getTechniqueCountPerSoftware().length >= 15"> (Top 15)</span>
      - Number (Sub)Techniques
    </div>
    <hr>
    <div v-for="(software, index) in getTechniqueCountPerSoftware()" :key="index" class="item-row">
      <div class="item-name">{{ software.name }}</div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: software.technique_count * 3.25 + 'px' }"
        ></div>
        <div 
          class="bar lightblue-bar" 
          :style="{ width: software.subtechnique_count * 3.25 + 'px' }"
        ></div>
        <span class="item-count">{{ software.technique_count + software.subtechnique_count }}</span>
      </div>
    </div>
  </div>
</template>


<style scoped>
.item-visualization {
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

.item-row {
  display: flex;
  align-items: center;
  margin: 5px;
}

.item-name {
  min-width: 170px;
  text-align: right;
  padding-right: 10px;
  font-size: 13px;
}

.bar-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  position: relative;
  height: 14px;
}

.bar {
  height: 14px;
}

.blue-bar {
  background-color: SteelBlue;
}

.lightblue-bar {
  background-color: #89AFCF;
}

.item-count {
  margin-left: 4px;
  font-size: 12px;
}
</style>
