<script setup lang="ts">
import { tacticsStore } from '@/stores/tactics';
const store = tacticsStore();

function getTactics(): any {
  let tactics;
  if (store.domain === 'enterprise-attack') {
      tactics = store.enterprise.tactics;
    } else if (store.domain === 'mobile-attack') {
      tactics = store.mobile.tactics;
    } else if (store.domain === 'ics-attack') {
      tactics = store.ics.tactics;
    }
  return tactics;
}

</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Tactics - Visibility Percentage
    </div>
    <hr>
    <div v-for="tactic in getTactics()" class="item-row">
      <div class="item-name">{{ tactic.name }}</div>
      <div class="bar-container">
        <div class="bar" :style="{ width: Math.round(tactic.techniques.reduce((sum, technique) => sum + (technique.visibility ? technique.visibility_ratio : 0), 0) / tactic.techniques.length * 100) * 1.75 + 'px' }">
          <span class="item-count">{{ Math.round(tactic.techniques.reduce((sum, technique) => sum + (technique.visibility ? technique.visibility_ratio : 0), 0) / tactic.techniques.length * 100) }}</span>
        </div>
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
}

.bar {
  height: 14px;
  background-color: SteelBlue;
  position: relative;
}

.item-count {
  position: absolute;
  left: 100%;
  margin-left: 4px;
  font-size: 12px;
}
</style>