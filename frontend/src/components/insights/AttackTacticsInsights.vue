<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Tactic {
  name: string;
  technique_count: number;
}

function getTechniqueCountPerTactic(): Tactic[] {
  let tactics;

  if (store.domain === 'enterprise-attack') {
    tactics = store.enterprise?.tactics;
  } else if (store.domain === 'mobile-attack') {
    tactics = store.mobile?.tactics;
  } else if (store.domain === 'ics-attack') {
    tactics = store.ics?.tactics;
  }

  // Check if tactics is defined and is an array
  if (!Array.isArray(tactics)) {
    return [];
  }

  return tactics.map((tactic) => ({
    name: tactic.name,
    technique_count: tactic.techniques.length,
  }));
}
</script>

<template>
  <div class="item-visualization">
    <div class=title>
      Technique Count Per Tactic  |  Domain: {{store.domain}}
    </div>
    <hr>
    <div v-for="(tactic, index) in getTechniqueCountPerTactic()" :key="index" class="item-row">
      <div class="item-name">{{ tactic.name }}</div>
      <div class="bar-container">
        <div class="bar" :style="{ width: tactic.technique_count * 10 + 'px' }">
          <span class="item-count">{{ tactic.technique_count }}</span>
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
