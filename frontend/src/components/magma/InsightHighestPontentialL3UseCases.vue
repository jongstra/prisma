<script setup lang="ts">
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();


function getHighestPotentialL3UseCases() {
  const useCases = magma.L3UseCases(store.domain);

  // Sort use cases on their potential in descending order.
  useCases.sort((a, b) => (b.potential??100) - (a.potential??100));

  return useCases
}


</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Highest Potential L3 Use Cases
      <span v-if="getHighestPotentialL3UseCases().length >= 15"> (Top 15)</span>
    </div>
    <hr>

    <div v-for="useCase in getHighestPotentialL3UseCases()" class="item-row">
      <div class="item-name">{{ useCase.id }}</div>
        <div class="bar-container">
          <div 
            class="bar" 
            :style="{ 
                width: (useCase.potential??100) * 2.7 + 'px', 
                backgroundColor: 'red'
              }"
          >
          <span class="item-count">{{ (useCase.potential??100).toFixed(2) }}%</span>
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
  min-width: 100px;
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
  position: relative;
}

.item-count {
  position: absolute;
  left: 100%;
  margin-left: 4px;
  font-size: 12px;
}
</style>
