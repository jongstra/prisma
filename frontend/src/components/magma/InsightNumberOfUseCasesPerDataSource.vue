<script setup lang="ts">
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();


function getMostFrequentDataSources() {
  const useCases = magma.L3UseCases(store.domain);

  const frequencyDict  = {};
  useCases.forEach(useCase => {
    frequencyDict[useCase.dataSource] = (frequencyDict[useCase.dataSource] || 0) + 1;
  })

  // Remove the 'undefined' entry.
  delete frequencyDict.undefined;

  // Sort the frequencyDict by values from high to low and convert back to an object.
  const sortedFrequencyDict = Object.fromEntries(Object.entries(frequencyDict).sort(([, a], [, b]) => b - a));
  return sortedFrequencyDict
}


</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Number of Use Cases per Data Source
      <span v-if="Object.keys(getMostFrequentDataSources()).length >= 15"> (Top 15)</span>
    </div>
    <hr>

    <div v-for="[dataSource, frequency] in Object.entries(getMostFrequentDataSources()).slice(0, 15)" class="item-row">
      <div class="item-name"> {{ dataSource }} </div>  
      <div class="bar-container">
        <div
          class="bar" 
          :style="{ 
              width: (frequency??0) * 3 + 'px',
              backgroundColor: 'red'
            }"
        >
          <span class="item-count">{{ (frequency??0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>

a {
  color: blue;
}

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
