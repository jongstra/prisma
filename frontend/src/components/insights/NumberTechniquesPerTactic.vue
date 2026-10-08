<script setup lang="ts">
import { computed } from 'vue';
import { barWidth } from '@/components/common/barWidth';
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

interface Tactic {
  name: string;
  technique_count: number;
  subtechnique_count: number;
}

function getTechniqueCountPerTactic(): Tactic[] {
  const tactics = store.currentDomain?.tactics;

  // Check if tactics is defined and is an array
  if (!Array.isArray(tactics)) {
    return [];
  }

  return tactics.map((tactic) => ({
    name: tactic.name,
    technique_count: tactic.technique_count,
    subtechnique_count: tactic.subtechnique_count,
  }));
}

// The longest bar in this chart fills the box.
const maxCount = computed(() => Math.max(0, ...getTechniqueCountPerTactic().map((x) => x.technique_count + x.subtechnique_count)));
</script>



<template>
  <div class="item-visualization">
    <div class="title">
      Tactics - Number of (Sub)Techniques
    </div>
    <hr>
    <div v-for="(tactic, index) in getTechniqueCountPerTactic()" :key="index" class="item-row">
      <div class="item-name">{{ tactic.name }}</div>
      <div class="bar-container">
        <div 
          class="bar blue-bar" 
          :style="{ width: barWidth(tactic.technique_count, maxCount) }"
        ></div>
        <div 
          class="bar lightblue-bar" 
          :style="{ width: barWidth(tactic.subtechnique_count, maxCount) }"
        ></div>
        <span class="item-count">{{ tactic.technique_count + tactic.subtechnique_count }}</span>
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
