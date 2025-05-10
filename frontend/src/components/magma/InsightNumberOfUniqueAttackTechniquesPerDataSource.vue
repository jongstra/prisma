<script setup lang="ts">
import { magmaStore } from '@/stores/magma';
import { tacticsStore } from '@/stores/tactics';

const store = tacticsStore();
const magma = magmaStore();


function getAttackTechniquesPerDataSource() {
  const useCases = magma.L3UseCases(store.domain);

  // Initialize frequencyDict as an object where each key is a dataSource and the value is a Set of attackTechniqueIds.
  const frequencyDict = {};
  useCases.forEach(useCase => {
    const dataSource = useCase.dataSource;
    if (!frequencyDict[dataSource]) {
      frequencyDict[dataSource] = new Set(); // Initialize as a set if not already present.
    }
    frequencyDict[dataSource].add(useCase.attackTechniqueId); // Add techniqueId to the set.
  });

  // Remove any 'undefined' entry from frequencyDict, if present.
  delete frequencyDict.undefined;

  // Sort the frequencyDict by the size of each Set (number of items) in descending order.
  const sortedFrequencyDict = Object.fromEntries(
    Object.entries(frequencyDict).sort(([, a], [, b]) => {
      // Compare the sizes of the Sets in descending order.
      return b.size - a.size;
    })
  );

  return sortedFrequencyDict;
}



</script>


<template>
  <div class="item-visualization">
    <div class="title">
      Number of Unique Attack Techniques per Data Source
      <span v-if="Object.keys(getAttackTechniquesPerDataSource()).length >= 15"> (Top 15)</span>
    </div>
    <hr>

    <div v-for="[dataSource, techniques] in Object.entries(getAttackTechniquesPerDataSource()).slice(0, 15)" class="item-row">
      <div class="item-name"> {{ dataSource }} </div>  
      <div class="bar-container">
        <div
          class="bar" 
          :style="{ 
              width: (techniques.size??0) * 3 + 'px',
              backgroundColor: 'red'
            }"
        >
          <span class="item-count">{{ (techniques.size??0) }}</span>
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
