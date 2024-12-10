<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Group {
  name: string;
  technique_count: number;
  subtechnique_count: number;
}

function getTechniqueCountPerGroup(): Group[] {
  let groups;

  if (store.domain === 'enterprise-attack') {
    groups = store.enterprise?.groups;
  } else if (store.domain === 'mobile-attack') {
    groups = store.mobile?.groups;
  } else if (store.domain === 'ics-attack') {
    groups = store.ics?.groups;
  }

  // Check if groups is defined and is an array
  if (!Array.isArray(groups)) {
    return [];
  }

  // Return the top 15 groups (they are pre-sorted in Python on all_technique_count). Remove any groups with a 0 all_technique_count.
  return groups
    .filter((group) => group.all_technique_count > 0)
    .slice(0, 15)
    .map((group) => ({
      name: group.name,
      technique_count: group.technique_count,
      subtechnique_count: group.subtechnique_count,
    }));
}
</script>

<template>
  <div class="item-visualization">
    <div class="title">
      Groups
      <span v-if="getTechniqueCountPerGroup().length >= 15"> (Top 15)</span>
      - Number (Sub)Techniques
    </div>
    <hr>
    <div v-for="(group, index) in getTechniqueCountPerGroup()" :key="index" class="item-row">
      <div class="item-name">{{ group.name }}</div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: group.technique_count * 2 + 'px' }"
        ></div>
        <div 
          class="bar lightblue-bar" 
          :style="{ width: group.subtechnique_count * 2 + 'px' }"
        ></div>
        <span class="item-count">{{ group.technique_count + group.subtechnique_count }}</span>
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
