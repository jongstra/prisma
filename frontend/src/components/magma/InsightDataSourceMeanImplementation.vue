<script setup lang="ts">
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();

function getDataSourceImplementation() {
  const useCases = magma.L3UseCases(store.domain);

  // Object to store the use case implementation values and keep a use case count, for each dataSource.
  const stats = {};

  useCases.forEach(useCase => {
    if (!stats[useCase.dataSource]) {
      stats[useCase.dataSource] = { sum: 0, count: 0 };
    }
    stats[useCase.dataSource].sum += Number(useCase.implementation);
    stats[useCase.dataSource].count += 1;
  });

  // Remove any 'undefined' entry from stats, if present.
  delete stats.undefined;

  // Calculate the mean for each dataSource
  Object.keys(stats).forEach(dataSource => {
    stats[dataSource].mean = stats[dataSource].sum / stats[dataSource].count;
  });

  // Sort the object by its mean values from low to high and convert back to an object.
  const sortedStats = Object.fromEntries(
    Object.entries(stats).sort(([, a], [, b]) => a.mean - b.mean)
  );

  return sortedStats
}
</script>



<template>
  <div class="item-visualization">
    <div class="title">
      Data Sources - Mean Implementation
      <span v-if="Object.keys(getDataSourceImplementation()).length >= 15"> (Top 15 Worst)</span>
    </div>
    <hr>

    <div v-for="[key, val] in Object.entries(getDataSourceImplementation()).slice(0, 15)" class="item-row">
      <div class="item-name"> {{ key }} </div> 
      <div class="bar-container">
        <div
          class="bar" 
          :style="{ 
              width: (val.mean||0) * 2.7 + 'px',
              backgroundColor: 'green'
            }"
        >
        <span class="item-val">{{ (val.mean??0).toFixed(2) }}%  ({{ val.count }}) </span>
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

.item-val {
  display: inline-block;
  position: absolute;
  left: 100%;
  font-size: 12px;
  width: 70px;
}
</style>