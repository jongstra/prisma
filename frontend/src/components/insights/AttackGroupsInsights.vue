<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Group {
  name: string;
  technique_count: number;
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

  return groups.slice(0, 20).map((group) => ({
    name: group.name,
    technique_count: group.technique_count,
  }));
}
</script>

<template>
  <div class="item-visualization">
    <div class=title>
      Technique Count per Group - Top 20
    </div>
    <hr>
    <div v-for="(group, index) in getTechniqueCountPerGroup()" :key="index" class="item-row">
      <div class="item-name">{{ group.name }}</div>
      <div class="bar-container">
        <div class="bar" :style="{ width: group.technique_count * 3.5 + 'px' }">
          <span class="item-count">{{ group.technique_count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-visualization {
  display: flex;
  flex-direction: column;
  border: 3px solid black;
  max-width: 650px;
}

.title {
  margin: 5px;
  font-size: px;
}

.item-row {
  display: flex;
  align-items: center;
  margin: 5px;
}

.item-name {
  min-width: 150px;
  text-align: right;
  padding-right: 10px;
  font-size: 12px;
}

.bar-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.bar {
  height: 14px;
  background-color: #3498db;
  position: relative;
}

.item-count {
  position: absolute;
  left: 100%;
  margin-left: 5px;
  font-size: 11px;
}
</style>
