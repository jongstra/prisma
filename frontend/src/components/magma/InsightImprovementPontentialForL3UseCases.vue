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
      Improvement Potential for L3 Use Cases
      <span v-if="getHighestPotentialL3UseCases().length >= 15"> (Top 15)</span>
    </div>
    <hr>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <div class="sub-bar red"></div>
        <span>Visibility Potential</span>
      </div>
      <div class="legend-item">
        <div class="sub-bar green"></div>
        <span>Implementation Potential</span>
      </div>
      <div class="legend-item">
        <div class="sub-bar blue"></div>
        <span>Effectiveness Potential</span>
      </div>
    </div>

    <!-- Loop through the top 15 use cases -->
    <div v-for="useCase in getHighestPotentialL3UseCases().slice(0, 15)" class="item-row">
      <div class="item-name">{{ useCase.id }}</div>
      
      <!-- Bar container with three sub-bars -->
      <div class="bar-container">
        
        <!-- Red bar for visibility potential -->
        <div 
          class="sub-bar red"
          :style="{ width: (((100 - Number(useCase.visibility)) / (300 - Number(useCase.visibility) - Number(useCase.implementation) - Number(useCase.effectiveness))) * (Number(useCase.potential)) * 2.7) + 'px' }"
        ></div>
        
        <!-- Green bar for implementation potential -->
        <div 
          class="sub-bar green"
          :style="{ width: (((100 - Number(useCase.implementation)) / (300 - Number(useCase.visibility) - Number(useCase.implementation) - Number(useCase.effectiveness))) * (Number(useCase.potential)) * 2.7) + 'px' }"
        ></div>
        
        <!-- Blue bar for effectiveness potential -->
        <div 
          class="sub-bar blue"
          :style="{ width: (((100 - Number(useCase.effectiveness)) / (300 - Number(useCase.visibility) - Number(useCase.implementation) - Number(useCase.effectiveness))) * (Number(useCase.potential)) * 2.7) + 'px' }"
        ></div>
      </div>

      <!-- Item count label -->
      <span class="item-count">{{ (useCase.potential ?? 100).toFixed(2) }}%</span>
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

.sub-bar {
  height: 14px;
  position: relative;
}

.red {
  background-color: red;
}

.green {
  background-color: green;
}

.blue {
  background-color: blue;
}

.item-count {
  /* position: absolute; */
  left: 100%;
  margin-left: 4px;
  font-size: 12px;
}

.legend {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 5px; /* Add some spacing above the legend */
  margin-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px; /* Space between the bar and label */
  font-size: 11px;
}

.legend-item .sub-bar {
  width: 20px; /* Fixed size for legend bars */
  height: 14px;
}

</style>
